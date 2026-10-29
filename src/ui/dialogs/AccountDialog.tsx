import type { DialogProps } from './types';
import { Modal } from '../components';
import { input } from '../helpers';
import { createUser, verifyPassword } from '../../application/auth';
import { session } from '../../data/storage';
import { LogOut } from 'lucide-react';
export default function AccountDialog({
  modal,
  data,
  user,
  errorBox,
  busy,
  run,
  commit,
  close,
  notify,
  setUserId,
  setInstitutionId,
}: Pick<
  DialogProps,
  | 'modal'
  | 'data'
  | 'user'
  | 'errorBox'
  | 'busy'
  | 'run'
  | 'commit'
  | 'close'
  | 'notify'
  | 'setUserId'
  | 'setInstitutionId'
>) {
  return (
    <>
      {modal === 'account' && (
        <Modal title="Minha conta" onClose={close}>
          <p>
            <strong>{user.name}</strong>
            <br />
            <span className="muted">{user.email}</span>
          </p>
          <h3>Alterar senha</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(async () => {
                if (!(await verifyPassword(user, input(f, 'current'))))
                  throw Error('Senha atual incorreta.');
                if (input(f, 'password') !== input(f, 'repeat'))
                  throw Error('As senhas não coincidem.');
                const updated = await createUser(user.name, user.email, input(f, 'password'));
                commit({
                  ...data,
                  users: data.users.map((u) =>
                    u.id === user.id ? { ...u, hash: updated.hash, salt: updated.salt } : u,
                  ),
                });
                close();
                notify('Senha alterada.');
              });
            }}
          >
            {errorBox}
            <label>
              Senha atual
              <input name="current" type="password" required autoComplete="current-password" />
            </label>
            <label>
              Nova senha
              <input
                name="password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            <label>
              Repita a nova senha
              <input
                name="repeat"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            <button className="primary" disabled={busy}>
              Alterar senha
            </button>
          </form>
          <hr />
          <button
            className="secondary"
            onClick={() => {
              session.clear();
              setUserId(null);
              setInstitutionId('');
              close();
            }}
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </Modal>
      )}
    </>
  );
}
