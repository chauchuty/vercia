import type { DialogProps } from './types';
import { Modal } from '../components';
import { input } from '../helpers';
import { createUser } from '../../application/auth';
export default function MemberDialog({
  modal,
  manager,
  selected,
  data,
  members,
  categories,
  errorBox,
  busy,
  run,
  manage,
  commit,
  close,
  notify,
}: Pick<
  DialogProps,
  | 'modal'
  | 'manager'
  | 'selected'
  | 'data'
  | 'members'
  | 'categories'
  | 'errorBox'
  | 'busy'
  | 'run'
  | 'manage'
  | 'commit'
  | 'close'
  | 'notify'
>) {
  return (
    <>
      {modal === 'member' &&
        manager &&
        (() => {
          const m = members.find((m) => m.id === selected)!;
          const u = data.users.find((u) => u.id === m.userId)!;
          return (
            <Modal title={`Gerenciar ${u.name}`} onClose={close}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(() => {
                    manage();
                    const active = f.has('active');
                    const role = input(f, 'role') as 'manager' | 'member';
                    if (
                      m.role === 'manager' &&
                      m.active &&
                      (!active || role !== 'manager') &&
                      members.filter((x) => x.role === 'manager' && x.active).length <= 1
                    )
                      throw Error('Mantenha pelo menos um gestor ativo na instituição.');
                    commit({
                      ...data,
                      memberships: data.memberships.map((x) =>
                        x.id === m.id
                          ? { ...x, active, role, categoryIds: f.getAll('categories').map(String) }
                          : x,
                      ),
                    });
                    close();
                    notify('Vínculo atualizado.');
                  });
                }}
              >
                {errorBox}
                <p className="muted">{u.email}</p>
                <label>
                  Perfil
                  <select name="role" defaultValue={m.role}>
                    <option value="member">Usuário</option>
                    <option value="manager">Gestor</option>
                  </select>
                </label>
                <fieldset>
                  <legend>Categorias</legend>
                  {categories
                    .filter((c) => !c.archived || m.categoryIds.includes(c.id))
                    .map((c) => (
                      <label className="check-label" key={c.id}>
                        <input
                          type="checkbox"
                          name="categories"
                          value={c.id}
                          defaultChecked={m.categoryIds.includes(c.id)}
                        />
                        {c.name}
                        {c.archived ? ' (arquivada)' : ''}
                      </label>
                    ))}
                </fieldset>
                <label className="check-label">
                  <input type="checkbox" name="active" defaultChecked={m.active} />
                  Vínculo ativo com a instituição
                </label>
                <button className="primary" disabled={busy}>
                  Salvar alterações
                </button>
              </form>
              <hr />
              <h3>Redefinir senha</h3>
              <p className="help">
                A senha é da conta e vale para todas as instituições. Compartilhe a nova senha
                manualmente com a pessoa.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(async () => {
                    manage();
                    const credentials = await createUser(u.name, u.email, input(f, 'password'));
                    commit({
                      ...data,
                      users: data.users.map((x) =>
                        x.id === u.id
                          ? { ...x, hash: credentials.hash, salt: credentials.salt }
                          : x,
                      ),
                    });
                    close();
                    notify('Senha redefinida. Oriente a pessoa a alterá-la após entrar.');
                  });
                }}
              >
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
                <button className="secondary" disabled={busy}>
                  Redefinir senha da conta
                </button>
              </form>
            </Modal>
          );
        })()}
    </>
  );
}
