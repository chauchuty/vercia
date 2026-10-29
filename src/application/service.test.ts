import { describe, it, expect } from 'vitest';
import { emptyDatabase, type Database, type Notice } from '../domain/models';
import { publishNotice, recordReceipt, validInvite } from './service';
const draft: Notice = {
  id: 'n',
  institutionId: 'school',
  authorId: 'manager',
  title: 'Reunião',
  body: 'Conteúdo',
  priority: 'high',
  requiresConfirmation: true,
  audience: 'categories',
  categoryIds: ['teachers', 'staff'],
  status: 'draft',
  createdAt: new Date().toISOString(),
  receipts: [],
};
function fixture(): Database {
  return {
    ...emptyDatabase(),
    memberships: [
      {
        id: 'm',
        userId: 'manager',
        institutionId: 'school',
        role: 'manager',
        active: true,
        categoryIds: [],
      },
      {
        id: 'a',
        userId: 'alice',
        institutionId: 'school',
        role: 'member',
        active: true,
        categoryIds: ['teachers', 'staff'],
      },
      {
        id: 'b',
        userId: 'bob',
        institutionId: 'other-school',
        role: 'member',
        active: true,
        categoryIds: ['teachers'],
      },
      {
        id: 'c',
        userId: 'carol',
        institutionId: 'school',
        role: 'member',
        active: false,
        categoryIds: ['teachers'],
      },
    ],
  };
}
describe('Publicação e ciência', () => {
  it('deduplica destinatários e respeita instituição e vínculos ativos', () => {
    const notice = publishNotice(fixture(), 'manager', draft);
    expect(notice.receipts).toEqual([{ userId: 'alice' }]);
  });
  it('impede publicação por usuário sem permissão e sem destinatários', () => {
    expect(() => publishNotice(fixture(), 'alice', draft)).toThrow('gestor');
    expect(() => publishNotice(fixture(), 'manager', { ...draft, categoryIds: ['empty'] })).toThrow(
      'destinatário',
    );
  });
  it('mantém destinatários após mudanças de categoria', () => {
    const db = fixture();
    const notice = publishNotice(db, 'manager', draft);
    db.notices = [notice];
    db.memberships = db.memberships.map((m) => ({ ...m, categoryIds: [] }));
    const opened = recordReceipt(db, 'alice', 'n');
    expect(opened.notices[0].receipts[0].openedAt).toBeTruthy();
  });
  it('separa abertura e confirmação e preserva o primeiro registro', () => {
    const db = fixture();
    db.notices = [publishNotice(db, 'manager', draft)];
    const opened = recordReceipt(db, 'alice', 'n');
    expect(opened.notices[0].receipts[0].confirmedAt).toBeUndefined();
    const confirmed = recordReceipt(opened, 'alice', 'n', true);
    const repeated = recordReceipt(confirmed, 'alice', 'n', true);
    expect(repeated.notices[0].receipts).toEqual(confirmed.notices[0].receipts);
    expect(confirmed.notices[0].receipts[0].openedAt).toBe(opened.notices[0].receipts[0].openedAt);
  });
  it('bloqueia leitura por destinatário de outra instituição ou desativado', () => {
    const db = fixture();
    db.notices = [publishNotice(db, 'manager', draft)];
    expect(() => recordReceipt(db, 'bob', 'n')).toThrow('acesso');
    db.memberships.find((m) => m.userId === 'alice')!.active = false;
    expect(() => recordReceipt(db, 'alice', 'n')).toThrow('acesso');
  });
  it('bloqueia leitura de notificação arquivada', () => {
    const db = fixture();
    db.notices = [{ ...publishNotice(db, 'manager', draft), status: 'archived' }];
    expect(() => recordReceipt(db, 'alice', 'n')).toThrow('acesso');
  });
});
describe('Validade de convites', () => {
  it('rejeita expirados, revogados e utilizados', () => {
    const invite = {
      id: 'i',
      institutionId: 'school',
      email: 'a@a.com',
      role: 'member' as const,
      expiresAt: new Date(Date.now() + 100000).toISOString(),
      used: false,
      revoked: false,
    };
    expect(validInvite(invite)).toBe(true);
    expect(validInvite({ ...invite, used: true })).toBe(false);
    expect(validInvite({ ...invite, revoked: true })).toBe(false);
    expect(validInvite({ ...invite, expiresAt: '2020-01-01' })).toBe(false);
  });
});
