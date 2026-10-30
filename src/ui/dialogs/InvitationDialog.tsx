import type { DialogProps } from './types';
import { Modal } from '../components';
import { uid, input } from '../helpers';
import { normalizeEmail } from '../../application/auth';
import { validInvite, membershipIsActive } from '../../application/service';
import { Link } from 'lucide-react';
export default function InvitationDialog({
  modal,
  manager,
  data,
  inst,
  members,
  categories,
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
  | 'categories'
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
                const validUntil = input(f, 'validUntil');
                if (
                  validUntil &&
                  !membershipIsActive({
                    id: '',
                    userId: '',
                    institutionId: inst,
                    role: 'member',
                    active: true,
                    categoryIds: [],
                    validUntil,
                  })
                )
                  throw Error('A validade do acesso não pode estar no passado.');
                const u = data.users.find((u) => u.email === email);
                if (
                  u &&
                  (u.isAdministrator ||
                    u.isManager ||
                    data.memberships.some((m) => m.userId === u.id && m.role === 'manager'))
                )
                  throw Error('Administradores e gestores não podem ser convidados como usuários.');
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
                      role: 'member',
                      categoryIds: f.getAll('categories').map(String),
                      validUntil: validUntil || undefined,
                      expiresAt: new Date(
                        Date.now() + Number(input(f, 'minutes')) * 60000,
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
            <label>
              Validade do convite
              <select name="minutes">
                <option value="5">5 minutos</option>
                <option value="10">10 minutos</option>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
              </select>
            </label>
            <label>
              Validade do acesso do usuário (opcional)
              <input type="date" name="validUntil" />
              <small className="help">O acesso termina às 23:59 do dia selecionado.</small>
            </label>
            <fieldset>
              <legend>Categorias do usuário</legend>
              {categories
                .filter((c) => !c.archived)
                .map((c) => (
                  <label className="check-label" key={c.id}>
                    <input type="checkbox" name="categories" value={c.id} />
                    {c.name}
                  </label>
                ))}
              {!categories.some((c) => !c.archived) && (
                <small className="help">Crie categorias para associá-las aos usuários.</small>
              )}
            </fieldset>
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
