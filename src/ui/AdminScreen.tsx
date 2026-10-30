import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Bell,
  Building2,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import PasswordInput from './PasswordInput';
import ThemeToggle from './ThemeToggle';
import AdminReports from './AdminReports';
import type { Database, User } from '../domain/models';
import { date } from './helpers';
import { Modal } from './components';
import { createUser, normalizeEmail } from '../application/auth';
import { input } from './helpers';

interface Props {
  data: Database;
  user: User;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onAccount: () => void;
  errorBox: ReactNode;
  busy: boolean;
  run: (action: () => void | Promise<void>) => Promise<void>;
  commit: (data: Database) => void;
  clearError: () => void;
  notify: (message: string) => void;
}
export default function AdminScreen({
  data,
  user,
  onCreate,
  onLogout,
  onAccount,
  errorBox,
  busy,
  run,
  commit,
  clearError,
  notify,
}: Props) {
  const [page, setPage] = useState<'dashboard' | 'managers' | 'reports'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const managers = data.users.filter(
    (u) =>
      !u.isAdministrator &&
      (u.isManager || data.memberships.some((m) => m.userId === u.id && m.role === 'manager')),
  );
  const activities = [...(data.managerActivities || [])].reverse();
  const editing = managers.find((manager) => manager.id === editingId);
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
          <button
            className={page === 'reports' ? 'active' : ''}
            aria-current={page === 'reports' ? 'page' : undefined}
            onClick={() => setPage('reports')}
          >
            <ChartNoAxesCombined size={19} /> Relatórios
          </button>
        </nav>
        <div className="sidebar-bottom">
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
            Administração{' '}
            <strong>
              {page === 'dashboard' ? 'Dashboard' : page === 'managers' ? 'Gestores' : 'Relatórios'}
            </strong>
          </span>
          <div className="admin-topbar-actions">
            <ThemeToggle />
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
          ) : page === 'reports' ? (
            <AdminReports data={data} managers={managers} />
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
                          <button
                            className="secondary admin-edit-button"
                            onClick={() => {
                              clearError();
                              setEditingId(manager.id);
                            }}
                            aria-label={`Editar ${manager.name}`}
                          >
                            Editar
                          </button>
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
      {editing && (
        <Modal
          title="Editar gestor"
          onClose={() => {
            setEditingId(null);
            clearError();
          }}
        >
          <p className="help">
            Altere os dados da conta. A senha só será alterada se você informar uma nova.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              run(async () => {
                if (!user.isAdministrator) throw Error('Acesso de administrador necessário.');
                const name = input(form, 'name');
                const email = normalizeEmail(input(form, 'email'));
                const password = input(form, 'password');
                if (!name) throw Error('Informe o nome do gestor.');
                if (!email) throw Error('Informe o e-mail do gestor.');
                if (
                  data.users.some((u) => u.id !== editing.id && normalizeEmail(u.email) === email)
                )
                  throw Error('Já existe uma conta com este e-mail.');
                const credentials = password ? await createUser(name, email, password) : null;
                commit({
                  ...data,
                  users: data.users.map((u) =>
                    u.id === editing.id
                      ? {
                          ...u,
                          name,
                          email,
                          ...(credentials
                            ? { hash: credentials.hash, salt: credentials.salt }
                            : {}),
                        }
                      : u,
                  ),
                });
                setEditingId(null);
                notify('Dados do gestor atualizados.');
              });
            }}
          >
            {errorBox}
            <label>
              Nome
              <input name="name" defaultValue={editing.name} required maxLength={120} />
            </label>
            <label>
              E-mail
              <input name="email" type="email" defaultValue={editing.email} required />
            </label>
            <label>
              Nova senha (opcional)
              <PasswordInput name="password" minLength={8} autoComplete="new-password" />
            </label>
            <button className="primary" disabled={busy}>
              Salvar alterações
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
