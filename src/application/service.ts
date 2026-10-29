import type { Database, Membership, Notice, Invite } from '../domain/models';
export function requireManager(db: Database, userId: string, institutionId: string) {
  if (
    !db.memberships.some(
      (m) =>
        m.userId === userId &&
        m.institutionId === institutionId &&
        m.active &&
        m.role === 'manager',
    )
  )
    throw Error('Acesso de gestor necessário.');
}
export function activeMembership(db: Database, userId: string, institutionId: string) {
  return db.memberships.find(
    (m) => m.userId === userId && m.institutionId === institutionId && m.active,
  );
}
export function validInvite(invite: Invite) {
  return !invite.used && !invite.revoked && new Date(invite.expiresAt).getTime() > Date.now();
}
export function recipients(db: Database, notice: Notice): Membership[] {
  return db.memberships.filter(
    (m) =>
      m.institutionId === notice.institutionId &&
      m.active &&
      (notice.audience === 'all' || m.categoryIds.some((id) => notice.categoryIds.includes(id))),
  );
}
export function publishNotice(db: Database, userId: string, notice: Notice): Notice {
  requireManager(db, userId, notice.institutionId);
  if (notice.status !== 'draft') throw Error('Somente rascunhos podem ser publicados.');
  if (!notice.title.trim() || !notice.body.trim()) throw Error('Preencha título e mensagem.');
  const audience = recipients(db, notice);
  if (!audience.length) throw Error('Nenhum destinatário ativo selecionado.');
  return {
    ...notice,
    status: 'published',
    publishedAt: new Date().toISOString(),
    receipts: audience.map((m) => ({ userId: m.userId })),
  };
}
export function recordReceipt(
  db: Database,
  userId: string,
  noticeId: string,
  confirm = false,
): Database {
  return {
    ...db,
    notices: db.notices.map((n) => {
      if (n.id !== noticeId) return n;
      if (
        !activeMembership(db, userId, n.institutionId) ||
        n.status !== 'published' ||
        !n.receipts.some((r) => r.userId === userId)
      )
        throw Error('Você não possui acesso a esta notificação.');
      if (confirm && !n.requiresConfirmation)
        throw Error('Esta notificação não exige confirmação.');
      return {
        ...n,
        receipts: n.receipts.map((r) =>
          r.userId !== userId
            ? r
            : {
                ...r,
                openedAt: r.openedAt || new Date().toISOString(),
                ...(confirm ? { confirmedAt: r.confirmedAt || new Date().toISOString() } : {}),
              },
        ),
      };
    }),
  };
}
