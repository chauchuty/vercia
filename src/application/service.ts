import type { Database, Membership, Notice, Invite, NoticeMessage } from '../domain/models';
export function membershipIsActive(m: Membership, now = new Date()) {
  if (!m.active) return false;
  if (!m.validUntil) return true;
  const [year, month, day] = m.validUntil.split('-').map(Number);
  return now.getTime() < new Date(year, month - 1, day + 1).getTime();
}
export function requireManager(db: Database, userId: string, institutionId: string) {
  if (db.users.some((u) => u.id === userId && u.isAdministrator))
    throw Error('Acesso de gestor necessário.');
  if (
    !db.memberships.some(
      (m) =>
        m.userId === userId &&
        m.institutionId === institutionId &&
        membershipIsActive(m) &&
        m.role === 'manager',
    )
  )
    throw Error('Acesso de gestor necessário.');
}
export function activeMembership(db: Database, userId: string, institutionId: string) {
  return db.memberships.find(
    (m) => m.userId === userId && m.institutionId === institutionId && membershipIsActive(m),
  );
}
export function validInvite(invite: Invite) {
  return !invite.used && !invite.revoked && new Date(invite.expiresAt).getTime() > Date.now();
}
export function recipients(db: Database, notice: Notice): Membership[] {
  const matches = db.memberships.filter(
    (m) =>
      m.institutionId === notice.institutionId &&
      membershipIsActive(m) &&
      !db.users.some((u) => u.id === m.userId && u.isAdministrator) &&
      (notice.audience === 'all' ||
        (notice.audience === 'categories'
          ? m.categoryIds.some((id) => notice.categoryIds.includes(id))
          : m.role === 'member' && (notice.recipientIds || []).includes(m.userId))),
  );
  const unique = new Map(matches.map((membership) => [membership.userId, membership]));
  return [...unique.values()];
}
export function publishNotice(db: Database, userId: string, notice: Notice): Notice {
  requireManager(db, userId, notice.institutionId);
  if (notice.status !== 'draft') throw Error('Somente rascunhos podem ser publicados.');
  if (!notice.title.trim() || !notice.body.trim()) throw Error('Preencha título e mensagem.');
  const audience = recipients(db, notice);
  if (
    notice.audience === 'individuals' &&
    new Set(notice.recipientIds || []).size !== audience.length
  )
    throw Error(
      'Uma pessoa selecionada não possui acesso ativo nesta instituição. Revise os destinatários.',
    );
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
export function sendNoticeMessage(
  db: Database,
  actorId: string,
  noticeId: string,
  message: NoticeMessage,
): Database {
  const notice = db.notices.find((n) => n.id === noticeId);
  if (!notice || notice.status !== 'published')
    throw Error('A conversa está disponível em notificações publicadas.');
  const body = message.body.trim();
  if (!body || body.length > 2000) throw Error('Escreva uma mensagem de até 2.000 caracteres.');
  if (message.authorId !== actorId) throw Error('Autor inválido.');
  const recipient = activeMembership(db, message.threadUserId, notice.institutionId);
  if (!recipient || !notice.receipts.some((receipt) => receipt.userId === message.threadUserId))
    throw Error('O destinatário não possui acesso ativo a esta notificação.');
  const actor = activeMembership(db, actorId, notice.institutionId);
  const isManager =
    actor?.role === 'manager' && !db.users.some((u) => u.id === actorId && u.isAdministrator);
  if (isManager) {
    if (
      !(notice.messages || []).some(
        (item) =>
          item.threadUserId === message.threadUserId && item.authorId === message.threadUserId,
      )
    )
      throw Error('A conversa precisa ser iniciada pelo destinatário.');
  } else if (!actor || actorId !== message.threadUserId)
    throw Error('Você não possui acesso a esta conversa.');
  return {
    ...db,
    notices: db.notices.map((n) =>
      n.id === noticeId ? { ...n, messages: [...(n.messages || []), { ...message, body }] } : n,
    ),
  };
}
