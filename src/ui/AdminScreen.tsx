import { useState, type FormEvent, type ReactNode } from 'react';
import { Bell, Building2, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import PasswordInput from './PasswordInput';
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
  const [page, setPage] = useState<'dashboard' | 'managers'>('dashboard');
  const managers = data.users.filter(
    (u) =>
      !u.isAdministrator &&
      (u.isManager || data.memberships.some((m) => m.userId === u.id && m.role === 'manager')),
  );
  const activities = [...(data.managerActivities || [])].reverse();
  return (
    <div className="app-shell admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Bell size={22} />
          </span>
          vercia<span className="brand-dot">.</span>
        </div>
        <div className="admin-sidebar-title">
          <span className="eyebrow">ADMINISTRAÇÃO</span>
        </div>
        <nav aria-label="Navegação do administrador">
          <button
            className={page === 'dashboard' ? 'active' : ''}
            aria-current={page === 'dashboard' ? 'page' : undefined}
            onClick={() => setPage('dashboard')}
          >
            <LayoutDashboard size={19} /> Dashboard
          </button>
          <button
            className={page === 'managers' ? 'active' : ''}
            aria-current={page === 'managers' ? 'page' : undefined}
            onClick={() => setPage('managers')}
          >
            <Users size={19} /> Gestores
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="settings-nav" onClick={onAccount}>
            <Settings size={18} /> Minha conta
          </button>
          <div className="profile">
            <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>Administrador</small>
            </div>
            <button className="icon-button" aria-label="Sair" onClick={onLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar admin-topbar">
          <span>
            Administração <strong>{page === 'dashboard' ? 'Dashboard' : 'Gestores'}</strong>
          </span>
          <div className="admin-topbar-actions">
            <button className="icon-button" aria-label="Minha conta" onClick={onAccount}>
              <Settings size={19} />
            </button>
            <button className="icon-button" aria-label="Sair" onClick={onLogout}>
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main className="main-content admin-content">
          {page === 'dashboard' ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ADMINISTRAÇÃO</span>
                  <h1>Olá, {user.name.split(' ')[0]}</h1>
                  <p>Acompanhe a atividade dos gestores.</p>
                </div>
              </div>
              <div className="admin-stats">
                <article className="stat">
                  <div>
                    <span>Gestores cadastrados</span>
                    <span className="stat-icon green">
                      <Users size={19} />
                    </span>
                  </div>
                  <strong>{managers.length}</strong>
                  <small>Contas de gestor</small>
                </article>
                <article className="stat">
                  <div>
                    <span>Instituições</span>
                    <span className="stat-icon blue">
                      <Building2 size={19} />
                    </span>
                  </div>
                  <strong>{data.institutions.length}</strong>
                  <small>Instituições cadastradas</small>
                </article>
              </div>
              <section className="panel admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Atividades dos gestores</h2>
                    <p>Alterações registradas neste navegador.</p>
                  </div>
                </div>
                {activities.length ? (
                  <ul className="admin-activity-list">
                    {activities.map((activity) => (
                      <li key={activity.id}>
                        <strong>
                          {data.users.find((u) => u.id === activity.userId)?.name || 'Gestor'}
                        </strong>
                        <span>{activity.description}</span>
                        <small>{date(activity.at)}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-empty">Nenhuma atividade registrada ainda.</p>
                )}
              </section>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ADMINISTRAÇÃO</span>
                  <h1>Gestores</h1>
                  <p>Crie contas e consulte os gestores cadastrados.</p>
                </div>
              </div>
              <div className="admin-manager-grid">
                <section className="panel admin-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Criar gestor</h2>
                      <p>Informe os dados para criar a conta.</p>
                    </div>
                  </div>
                  <div className="admin-panel-body">
                    {errorBox}
                    <form className="admin-form" onSubmit={onCreate}>
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
                  </div>
                </section>
                <section className="panel admin-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Gestores cadastrados</h2>
                      <p>
                        {managers.length} {managers.length === 1 ? 'conta' : 'contas'}
                      </p>
                    </div>
                  </div>
                  {managers.length ? (
                    <ul className="admin-manager-list">
                      {managers.map((manager) => (
                        <li key={manager.id}>
                          <span className="avatar">{manager.name.slice(0, 2).toUpperCase()}</span>
                          <div>
                            <strong>{manager.name}</strong>
                            <small>{manager.email}</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-empty">Nenhum gestor cadastrado.</p>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
