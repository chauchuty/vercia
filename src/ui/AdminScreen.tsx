import PasswordInput from './PasswordInput';
import type { FormEvent, ReactNode } from 'react';
import type { Database, User } from '../domain/models';
import { date } from './helpers';

interface Props {
  data: Database;
  user: User;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onAccount: () => void;
  errorBox: ReactNode;
  busy: boolean;
}
export default function AdminScreen({
  data,
  user,
  onCreate,
  onLogout,
  onAccount,
  errorBox,
  busy,
}: Props) {
  const managers = data.users.filter(
    (u) =>
      !u.isAdministrator &&
      (u.isManager || data.memberships.some((m) => m.userId === u.id && m.role === 'manager')),
  );
  return (
    <main className="auth-main" style={{ minHeight: '100vh', alignItems: 'start' }}>
      <section className="auth-form" style={{ maxWidth: 800, width: '100%' }}>
        <span className="eyebrow">VERCIA · ADMINISTRAÇÃO</span>
        <h1>Gestores e atividades</h1>
        <p className="muted">
          Olá, {user.name}. Crie contas de gestor e acompanhe as ações registradas.
        </p>
        <h2>Criar gestor</h2>
        {errorBox}
        <form onSubmit={onCreate}>
          <label>
            Nome
            <input name="name" required maxLength={120} />
          </label>
          <label>
            E-mail
            <input name="email" type="email" required />
          </label>
          <label>
            Senha inicial
            <PasswordInput
              name="password"

              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          <button className="primary" disabled={busy}>
            Criar conta de gestor
          </button>
        </form>
        <h2>Gestores</h2>
        {managers.length ? (
          managers.map((manager) => (
            <p key={manager.id}>
              <strong>{manager.name}</strong> · {manager.email}
            </p>
          ))
        ) : (
          <p className="muted">Nenhum gestor cadastrado.</p>
        )}
        <h2>Atividades dos gestores</h2>
        {(data.managerActivities || []).length ? (
          [...(data.managerActivities || [])].reverse().map((activity) => (
            <p key={activity.id}>
              <strong>{data.users.find((u) => u.id === activity.userId)?.name || 'Gestor'}</strong>{' '}
              · {activity.description}
              <br />
              <small>{date(activity.at)}</small>
            </p>
          ))
        ) : (
          <p className="muted">Nenhuma atividade registrada ainda.</p>
        )}
        <p className="help">
          As atividades são registradas a partir desta atualização neste navegador.
        </p>
        <button className="text-button" onClick={onAccount}>
          Minha conta
        </button>{' '}
        <button className="text-button" onClick={onLogout}>
          Sair
        </button>
      </section>
    </main>
  );
}
