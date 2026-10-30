import type { DialogProps } from './types';
import { Modal } from '../components';
import { validInvite, membershipIsActive } from '../../application/service';
import { date } from '../helpers';
export default function InviteDetails({
  modal,
  manager,
  selected,
  invites,
  categories,
  members,
  data,
  close,
  openModal,
}: Pick<
  DialogProps,
  | 'modal'
  | 'manager'
  | 'selected'
  | 'invites'
  | 'categories'
  | 'members'
  | 'data'
  | 'close'
  | 'openModal'
>) {
  const invite = invites.find((i) => i.id === selected);
  if (modal !== 'invite-details' || !manager || !invite) return null;
  const status = invite.used
    ? 'Aceito'
    : invite.revoked
      ? 'Revogado'
      : validInvite(invite)
        ? 'Pendente'
        : 'Expirado';
  const names = (invite.categoryIds || [])
    .map((id) => categories.find((category) => category.id === id)?.name)
    .filter(Boolean);
  const account = data.users.find((user) => user.email === invite.email);
  const hasAccess =
    account && members.some((member) => member.userId === account.id && membershipIsActive(member));
  return (
    <Modal title="Detalhes do convite" onClose={close}>
      <dl className="invite-details">
        <div>
          <dt>E-mail</dt>
          <dd>{invite.email}</dd>
        </div>
        <div>
          <dt>Situação</dt>
          <dd>{status}</dd>
        </div>
        <div>
          <dt>Validade do convite</dt>
          <dd>{date(invite.expiresAt)}</dd>
        </div>
        <div>
          <dt>Validade do acesso</dt>
          <dd>
            {invite.validUntil
              ? invite.validUntil.split('-').reverse().join('/')
              : 'Sem data final'}
          </dd>
        </div>
        <div>
          <dt>Categorias</dt>
          <dd>{names.join(', ') || 'Nenhuma'}</dd>
        </div>
      </dl>
      {!validInvite(invite) && !hasAccess && invite.role === 'member' && (
        <button className="secondary" onClick={() => openModal('invite', invite.id)}>
          Gerar novo convite
        </button>
      )}
    </Modal>
  );
}
