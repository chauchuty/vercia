import type { DialogProps } from './types';
import { Modal } from '../components';
import { uid, input } from '../helpers';
import { normalizeEmail } from '../../application/auth';
import { validInvite } from '../../application/service';
import { Link } from 'lucide-react';
export default function InvitationDialog({
  modal,
  manager,
  data,
  inst,
  members,
  invites,
  errorBox,
  busy,
  run,
  manage,
  commit,
  close,
  notify,
  setPage,
}: Pick<
  DialogProps,
  | 'modal'
  | 'manager'
  | 'data'
  | 'inst'
  | 'members'
  | 'invites'
  | 'errorBox'
  | 'busy'
  | 'run'
  | 'manage'
  | 'commit'
  | 'close'
  | 'notify'
  | 'setPage'
>) {
  return (
    <>
      {modal === 'invite' && manager && (
        <Modal title="Convidar pessoa" onClose={close}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(() => {
                manage();
                const email = normalizeEmail(input(f, 'email'));
                const u = data.users.find((u) => u.email === email);
                if (u && members.some((m) => m.userId === u.id && m.active))
                  throw Error('Esta pessoa já participa da instituição.');
                if (invites.some((i) => i.email === email && validInvite(i)))
                  throw Error('Já existe um convite pendente para este e-mail.');
                commit({
                  ...data,
                  invites: [
                    ...data.invites,
                    {
                      id: uid(),
                      institutionId: inst,
                      email,
                      role: input(f, 'role') as 'member' | 'manager',
                      expiresAt: new Date(
                        Date.now() + Number(input(f, 'days')) * 86400000,
                      ).toISOString(),
                      used: false,
                      revoked: false,
                    },
                  ],
                });
                close();
                setPage('invites');
                notify('Convite criado. Copie o link para compartilhar.');
              });
            }}
          >
            {errorBox}
            <p className="muted">
              O convite é exclusivo para o e-mail informado. Compartilhe o link manualmente.
            </p>
            <label>
              E-mail
              <input type="email" name="email" required placeholder="pessoa@exemplo.com" />
            </label>
            <div className="form-grid">
              <label>
                Perfil
                <select name="role">
                  <option value="member">Usuário</option>
                  <option value="manager">Gestor</option>
                </select>
              </label>
              <label>
                Validade
                <select name="days">
                  <option value="7">7 dias</option>
                  <option value="1">1 dia</option>
                  <option value="30">30 dias</option>
                </select>
              </label>
            </div>
            <button className="primary" disabled={busy}>
              <Link size={17} />
              Gerar convite
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
