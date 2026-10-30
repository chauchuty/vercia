import { describe, it, expect } from 'vitest';
import { emptyDatabase, type Database, type Notice } from '../domain/models';
import {
  membershipIsActive,
  publishNotice,
  recordReceipt,
  validInvite,
  requireManager,
  sendNoticeMessage,
} from './service';
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
  it('envia somente para as pessoas selecionadas, sem duplicar entregas', () => {
    const db = fixture();
    db.memberships.push({
      id: 'd',
      userId: 'diana',
      institutionId: 'school',
      role: 'member',
      active: true,
      categoryIds: [],
    });
    const individual = {
      ...draft,
      audience: 'individuals' as const,
      recipientIds: ['alice', 'diana', 'alice'],
    };
    expect(publishNotice(db, 'manager', individual).receipts).toEqual([
      { userId: 'alice' },
      { userId: 'diana' },
    ]);
  });
  it('rejeita pessoas inativas ou de outra instituição e seleção vazia', () => {
    const db = fixture();
    const individual = { ...draft, audience: 'individuals' as const };
    expect(() =>
      publishNotice(db, 'manager', { ...individual, recipientIds: ['alice', 'bob'] }),
    ).toThrow('acesso ativo');
    expect(() => publishNotice(db, 'manager', { ...individual, recipientIds: ['carol'] })).toThrow(
      'acesso ativo',
    );
    expect(() => publishNotice(db, 'manager', { ...individual, recipientIds: [] })).toThrow(
      'destinatário',
    );
  });
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
describe('Mensagens de notificações', () => {
  const message = {
    id: 'message',
    threadUserId: 'alice',
    authorId: 'alice',
    body: 'Olá',
    createdAt: '2026-01-01T12:00:00Z',
  };
  function withNotice() {
    const db = fixture();
    db.notices = [publishNotice(db, 'manager', draft)];
    return db;
  }
  it('permite que o destinatário inicie e o gestor responda na mesma conversa', () => {
    const db = sendNoticeMessage(withNotice(), 'alice', 'n', message);
    const replied = sendNoticeMessage(db, 'manager', 'n', {
      ...message,
      id: 'reply',
      authorId: 'manager',
      body: 'Resposta',
    });
    expect(replied.notices[0].messages?.map((m) => m.body)).toEqual(['Olá', 'Resposta']);
  });
  it('impede acesso de terceiros, resposta sem conversa e envio em notificação arquivada', () => {
    const db = withNotice();
    expect(() => sendNoticeMessage(db, 'bob', 'n', { ...message, authorId: 'bob' })).toThrow(
      'acesso',
    );
    expect(() =>
      sendNoticeMessage(db, 'manager', 'n', { ...message, authorId: 'manager' }),
    ).toThrow('iniciada');
    db.notices[0].status = 'archived';
    expect(() => sendNoticeMessage(db, 'alice', 'n', message)).toThrow('publicadas');
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
describe('Validade do acesso', () => {
  it('mantém o acesso até o final do dia local e bloqueia a partir do dia seguinte', () => {
    const membership = { ...fixture().memberships[1], validUntil: '2026-10-30' };
    expect(membershipIsActive(membership, new Date(2026, 9, 30, 23, 59, 59))).toBe(true);
    expect(membershipIsActive(membership, new Date(2026, 9, 31, 0, 0, 0))).toBe(false);
    expect(membershipIsActive({ ...membership, active: false }, new Date(2026, 9, 30))).toBe(false);
  });
  it('impede administrador com vínculo antigo de atuar como gestor', () => {
    const db = fixture();
    db.users.push({
      id: 'manager',
      name: 'Admin',
      email: 'a@a.com',
      hash: '',
      salt: '',
      isAdministrator: true,
    });
    expect(() => requireManager(db, 'manager', 'school')).toThrow('gestor');
  });
});
