import { createInstitution, institutionTextColor } from '../domain/institution';
import { categoryColor, categoryIcon } from './categoryIcons';
import AccountDialog from './dialogs/AccountDialog';
import ArchiveDialog from './dialogs/ArchiveDialog';
import DeleteDraftDialog from './dialogs/DeleteDraftDialog';
import NoticeReport from './dialogs/NoticeReport';
import ReadingDialog from './dialogs/ReadingDialog';
import MemberDialog from './dialogs/MemberDialog';
import CategoryDialog from './dialogs/CategoryDialog';
import InvitationDialog from './dialogs/InvitationDialog';
import InviteDetails from './dialogs/InviteDetails';
import NoticeEditor from './dialogs/NoticeEditor';
import Dashboard from './Dashboard';
import InstitutionSetup from './InstitutionSetup';
import InstitutionPicker from './InstitutionPicker';
import AuthScreen from './AuthScreen';
import UserWorkspace from './UserWorkspace';
import { Pagination } from './Pagination';
import AdminScreen from './AdminScreen';
import NoticeTable from './NoticeTable';
import { Empty } from './components';
import { useEffect, useState, type FormEvent } from 'react';
import {
  Bell,
  LayoutDashboard,
  Users,
  Tags,
  Link,
  LogOut,
  Plus,
  ArrowUpRight,
  Search,
  Check,
  ChevronRight,
  Building2,
  AlertTriangle,
  Settings,
  Copy,
  Send,
} from 'lucide-react';
import type { Database, Notice, Priority, User } from '../domain/models';
import { loadDatabase, saveDatabase, session, DATABASE_KEY } from '../data/storage';
import { createUser, normalizeEmail, verifyPassword } from '../application/auth';
import {
  publishNotice,
  recordReceipt,
  requireManager,
  validInvite,
  membershipIsActive,
} from '../application/service';
import { uid, date, input } from './helpers';
export default function App() {
  const [initial] = useState(() => {
    try {
      return { db: loadDatabase(), error: '' };
    } catch (e) {
      return { db: null, error: (e as Error).message };
    }
  });
  const [db, setDb] = useState<Database | null>(initial.db);
  const [userId, setUserId] = useState(session.get);
  const [institutionId, setInstitutionId] = useState('');
  const [creatingInstitution, setCreatingInstitution] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [error, setError] = useState(initial.error);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [peoplePage, setPeoplePage] = useState(1);
  const [invitePage, setInvitePage] = useState(1);
  const [inviteToken, setInviteToken] = useState(
    new URLSearchParams(location.search).get('invite') || '',
  );
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === DATABASE_KEY) {
        try {
          setDb(loadDatabase());
        } catch (e) {
          setError((e as Error).message);
        }
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    setPeoplePage(1);
    setInvitePage(1);
  }, [institutionId]);
  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 4500);
  }
  function commit(next: Database) {
    const actor = db?.users.find((u) => u.id === userId);
    if (
      db &&
      actor &&
      !actor.isAdministrator &&
      (actor.isManager ||
        db.memberships.some((m) => m.userId === actor.id && m.active && m.role === 'manager'))
    ) {
      const labels = {
        institutions: 'instituições',
        memberships: 'vínculos',
        categories: 'categorias',
        invites: 'convites',
        notices: 'notificações',
      } as const;
      const changes = (Object.keys(labels) as (keyof typeof labels)[]).filter(
        (key) => JSON.stringify(db[key]) !== JSON.stringify(next[key]),
      );
      if (changes.length)
        next = {
          ...next,
          managerActivities: [
            ...(db.managerActivities || []),
            {
              id: uid(),
              userId: actor.id,
              at: new Date().toISOString(),
              description: `Atualizou ${changes.map((key) => labels[key]).join(', ')}.`,
            },
          ],
        };
    }
    saveDatabase(next);
    setDb(next);
  }
  async function run(action: () => void | Promise<void>) {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!db)
    return (
      <main className="fatal">
        <h1>Não foi possível abrir o Vercia</h1>
        <p role="alert">{error}</p>
      </main>
    );
  const data = db;
  const user = db.users.find((u) => u.id === userId);
  const memberships = db.memberships.filter((m) => m.userId === userId && membershipIsActive(m));
  const membership = memberships.find((m) => m.institutionId === institutionId) || memberships[0];
  const institution = db.institutions.find((i) => i.id === membership?.institutionId);
  const inst = institution?.id || '';
  const manager = membership?.role === 'manager';
  function manage() {
    if (!user) throw Error('Entre na sua conta.');
    requireManager(data, user.id, inst);
  }
  function openModal(kind: string, id?: string) {
    setSelected(id || null);
    setError('');
    setModal(kind);
  }
  function close() {
    setModal(null);
    setError('');
  }
  function login(u: User) {
    session.set(u.id);
    setUserId(u.id);
    setInstitutionId('');
    setPage('dashboard');
  }
  async function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      const u = data.users.find((u) => u.email === normalizeEmail(input(f, 'email')));
      if (!u || !(await verifyPassword(u, input(f, 'password'))))
        throw Error('E-mail ou senha incorretos.');
      login(u);
    });
  }
  async function setup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      if (
        !user ||
        user.isAdministrator ||
        !(user.isManager || memberships.some((m) => m.role === 'manager'))
      )
        throw Error('Somente gestores podem criar instituições.');
      const name = input(f, 'institution');
      const id = uid();
      const newInstitution = {
        ...createInstitution(id, name, input(f, 'acronym'), input(f, 'color')),
        phone: input(f, 'phone'),
        email: input(f, 'email'),
        address: input(f, 'address'),
      };
      commit({
        ...data,
        institutions: [...data.institutions, newInstitution],
        memberships: [
          ...data.memberships,
          {
            id: uid(),
            userId: user.id,
            institutionId: id,
            role: 'manager',
            active: true,
            categoryIds: [],
          },
        ],
      });
      setInstitutionId('');
      setCreatingInstitution(false);
    });
  }
  async function acceptInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      const invite = data.invites.find((i) => i.id === inviteToken);
      if (!invite || !validInvite(invite))
        throw Error('Convite inválido, expirado, utilizado ou revogado.');
      if (invite.role !== 'member')
        throw Error('Este convite antigo de gestor não pode mais ser utilizado.');
      if (
        invite.validUntil &&
        !membershipIsActive({
          id: '',
          userId: '',
          institutionId: '',
          role: 'member',
          active: true,
          categoryIds: [],
          validUntil: invite.validUntil,
        })
      )
        throw Error('A validade do acesso deste convite já terminou.');
      let u = user;
      let users = data.users;
      if (!u) {
        const existing = users.find((u) => u.email === invite.email);
        if (existing) {
          if (!(await verifyPassword(existing, input(f, 'password'))))
            throw Error('Senha incorreta para a conta convidada.');
          u = existing;
        } else {
          u = await createUser(input(f, 'name'), invite.email, input(f, 'password'));
          users = [...users, u];
        }
      }
      if (u.email !== invite.email) throw Error('Entre com a conta do e-mail convidado.');
      if (
        u.isAdministrator ||
        u.isManager ||
        data.memberships.some((m) => m.userId === u!.id && m.role === 'manager')
      )
        throw Error('Contas de administrador e gestor não podem aceitar convites de usuário.');
      const prior = data.memberships.find(
        (m) => m.userId === u!.id && m.institutionId === invite.institutionId,
      );
      if (prior && membershipIsActive(prior)) throw Error('Você já participa desta instituição.');
      commit({
        ...data,
        users,
        invites: data.invites.map((i) => (i.id === invite.id ? { ...i, used: true } : i)),
        memberships: prior
          ? data.memberships.map((m) =>
              m.id === prior.id
                ? {
                    ...m,
                    active: true,
                    role: 'member',
                    categoryIds: invite.categoryIds || [],
                    validUntil: invite.validUntil,
                  }
                : m,
            )
          : [
              ...data.memberships,
              {
                id: uid(),
                userId: u.id,
                institutionId: invite.institutionId,
                role: 'member',
                active: true,
                categoryIds: invite.categoryIds || [],
                validUntil: invite.validUntil,
              },
            ],
      });
      login(u);
      setInstitutionId(invite.institutionId);
      setInviteToken('');
      history.replaceState(null, '', location.pathname);
      notify('Convite aceito. Bem-vindo à instituição!');
    });
  }
  const invite = data.invites.find((i) => i.id === inviteToken);
  const errorBox = error && (
    <div className="error" role="alert">
      <AlertTriangle size={17} />
      {error}
    </div>
  );
  if (!user || inviteToken)
    return (
      <AuthScreen
        data={data}
        user={user}
        invite={invite}
        inviteToken={inviteToken}
        errorBox={errorBox}
        busy={busy}
        onAccept={acceptInvite}
        onLogin={authenticate}
        onBack={() => {
          setInviteToken('');
          history.replaceState(null, '', location.pathname);
        }}
      />
    );
  if (user.isAdministrator)
    return (
      <>
        <AdminScreen
          data={data}
          user={user}
          errorBox={errorBox}
          busy={busy}
          onAccount={() => openModal('account')}
          onLogout={() => {
            session.clear();
            setUserId(null);
          }}
          onCreate={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const element = e.currentTarget;
            run(async () => {
              const email = normalizeEmail(input(form, 'email'));
              if (data.users.some((u) => u.email === email))
                throw Error('Já existe uma conta com este e-mail.');
              const created = await createUser(input(form, 'name'), email, input(form, 'password'));
              if (!created.name) throw Error('Informe o nome do gestor.');
              commit({ ...data, users: [...data.users, { ...created, isManager: true }] });
              element.reset();
            });
          }}
        />
        <AccountDialog
          modal={modal}
          data={data}
          user={user}
          errorBox={errorBox}
          busy={busy}
          run={run}
          commit={commit}
          close={close}
          notify={notify}
          setUserId={setUserId}
          setInstitutionId={setInstitutionId}
        />
      </>
    );
  const managerMemberships = memberships.filter((m) => m.role === 'manager');
  const canManageInstitutions = !!user.isManager || managerMemberships.length > 0;
  if (canManageInstitutions && !institutionId && !creatingInstitution)
    return (
      <InstitutionPicker
        user={user}
        institutions={data.institutions.filter((i) =>
          managerMemberships.some((m) => m.institutionId === i.id),
        )}
        onSelect={(id) => {
          setInstitutionId(id);
          setPage('dashboard');
        }}
        onCreate={() => {
          setEditingInstitution(false);
          setCreatingInstitution(true);
        }}
        onLogout={() => {
          session.clear();
          setUserId(null);
        }}
      />
    );
  if (canManageInstitutions && creatingInstitution)
    return (
      <InstitutionSetup
        user={user}
        onSubmit={
          editingInstitution && institution
            ? (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                run(() => {
                  manage();
                  const updated = {
                    ...institution,
                    ...createInstitution(
                      institution.id,
                      input(form, 'institution'),
                      input(form, 'acronym'),
                      input(form, 'color'),
                    ),
                    phone: input(form, 'phone'),
                    email: input(form, 'email'),
                    address: input(form, 'address'),
                  };
                  commit({
                    ...data,
                    institutions: data.institutions.map((item) =>
                      item.id === updated.id ? updated : item,
                    ),
                  });
                  setCreatingInstitution(false);
                  notify('Instituição atualizada.');
                });
              }
            : setup
        }
        institution={editingInstitution ? institution : undefined}
        onLogout={() => {
          session.clear();
          setUserId(null);
        }}
        errorBox={errorBox}
        busy={busy}
        onBack={() => setCreatingInstitution(false)}
      />
    );
  const actor = user;
  const notices = data.notices.filter((n) => n.institutionId === inst);
  const members = data.memberships.filter(
    (m) =>
      m.institutionId === inst && !data.users.some((u) => u.id === m.userId && u.isAdministrator),
  );
  const people = members.filter((m) => m.userId !== user.id);
  const categories = data.categories.filter((c) => c.institutionId === inst);
  const invites = data.invites.filter((i) => i.institutionId === inst);
  const peoplePages = Math.max(1, Math.ceil(people.length / 10));
  const currentPeoplePage = Math.min(peoplePage, peoplePages);
  const invitePages = Math.max(1, Math.ceil(invites.length / 10));
  const currentInvitePage = Math.min(invitePage, invitePages);
  const published = notices.filter((n) => n.status === 'published');
  const mine = published.filter((n) => n.receipts.some((r) => r.userId === user.id));
  const unread = mine.filter((n) => !n.receipts.find((r) => r.userId === user.id)?.openedAt);
  const nav = [
    { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'inbox', label: 'Minha caixa', icon: Bell },
    ...(manager
      ? [
          { id: 'notices', label: 'Notificações', icon: Send },
          { id: 'members', label: 'Pessoas', icon: Users },
          { id: 'categories', label: 'Categorias', icon: Tags },
          { id: 'invites', label: 'Convites', icon: Link },
        ]
      : []),
  ];
  const currentNotice = notices.find((n) => n.id === selected);
  function openNotice(n: Notice) {
    run(() => {
      commit(recordReceipt(data, actor.id, n.id));
      openModal('read', n.id);
    });
  }
  async function saveNotice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const native = e.nativeEvent as SubmitEvent;
    const publish = (native.submitter as HTMLButtonElement)?.value === 'publish';
    const f = new FormData(e.currentTarget);
    await run(() => {
      manage();
      const old = selected ? notices.find((n) => n.id === selected) : undefined;
      if (old && old.status !== 'draft') throw Error('Uma publicação não pode ser editada.');
      let notice: Notice = {
        id: old?.id || uid(),
        institutionId: inst,
        authorId: actor.id,
        title: input(f, 'title'),
        body: input(f, 'body'),
        priority: input(f, 'priority') as Priority,
        requiresConfirmation: f.has('confirmation'),
        audience: input(f, 'audience') as 'all' | 'categories',
        categoryIds: f.getAll('categories').map(String),
        status: 'draft',
        createdAt: old?.createdAt || new Date().toISOString(),
        receipts: [],
      };
      if (notice.audience === 'categories' && !notice.categoryIds.length)
        throw Error('Selecione pelo menos uma categoria.');
      if (publish) notice = publishNotice(data, actor.id, notice);
      commit({
        ...data,
        notices: old
          ? data.notices.map((n) => (n.id === notice.id ? notice : n))
          : [...data.notices, notice],
      });
      close();
      notify(publish ? 'Notificação publicada com sucesso.' : 'Rascunho salvo.');
    });
  }
  const dialogProps = {
    modal,
    manager,
    currentNotice,
    selected,
    data,
    inst,
    user,
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
    openModal,
    saveNotice,
    setPage,
    setUserId,
    setInstitutionId,
  };
  if (!manager)
    return (
      <>
        <UserWorkspace
          user={user}
          data={data}
          institution={institution}
          memberships={memberships}
          notices={notices}
          onInstitutionChange={(id) => {
            setInstitutionId(id);
            setPage('dashboard');
          }}
          onOpen={openNotice}
          onAccount={() => openModal('account')}
        />
        {error && !modal && <div className="user-error">{errorBox}</div>}
        <ReadingDialog {...dialogProps} />
        <AccountDialog {...dialogProps} />
        {toast && (
          <div className="toast" role="status">
            <Check size={18} />
            {toast}
          </div>
        )}
      </>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Bell size={22} />
          </span>
          vercia<span className="brand-dot">.</span>
        </div>
        <div className="institution">
          <div
            className="institution-symbol"
            style={
              institution
                ? {
                    backgroundColor: institution.color,
                    color: institutionTextColor(institution.color),
                  }
                : undefined
            }
            aria-label={institution ? `Sigla ${institution.acronym}` : undefined}
          >
            {institution?.acronym || <Building2 size={21} />}
          </div>
          <div>
            <strong>{institution?.name || 'Sem instituição'}</strong>
            <small>{manager ? 'Espaço de gestão' : 'Comunidade escolar'}</small>
          </div>
          {manager && (
            <button
              className="institution-settings"
              aria-label="Configurar instituição"
              title="Configurar instituição"
              onClick={() => {
                setEditingInstitution(true);
                setCreatingInstitution(true);
              }}
            >
              <Settings size={16} />
            </button>
          )}
        </div>
        <button
          className="institution-switch text-button"
          onClick={() => {
            setInstitutionId('');
            setPage('dashboard');
          }}
        >
          Trocar instituição
        </button>
        <span className="nav-label">PRINCIPAL</span>
        <nav aria-label="Navegação principal">
          {nav.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'active' : ''}
              onClick={() => {
                setPage(item.id);
                setFilter('all');
                setSearch('');
              }}
            >
              <item.icon size={19} />
              {item.label}
              {item.id === 'inbox' && unread.length > 0 && (
                <span className="nav-count">{unread.length}</span>
              )}
            </button>
          ))}
        </nav>
        <small className="mobile-scroll-hint">Deslize o menu para ver mais opções</small>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{manager ? 'Gestor' : 'Usuário'}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Sair"
              onClick={() => {
                session.clear();
                setUserId(null);
                setInstitutionId('');
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Seu colégio <ChevronRight size={14} />
            <strong>{nav.find((n) => n.id === page)?.label}</strong>
          </span>
          <div>
            <span className="local-chip">
              <span className="status-dot" />
              Ambiente local
            </span>
            <button
              className="icon-button"
              aria-label="Abrir minha caixa"
              onClick={() => {
                setPage('inbox');
                setFilter('all');
              }}
            >
              <Bell size={19} />
            </button>
            <button
              className="avatar small"
              aria-label="Minha conta"
              onClick={() => openModal('account')}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="main-content">
          {error && !modal && errorBox}
          {!membership ? (
            <Empty
              title="Você precisa de um convite"
              description="Peça ao gestor o link de acesso à instituição."
            />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">{manager ? 'ESPAÇO DO GESTOR' : 'SUA COMUNIDADE'}</span>
                  <h1>
                    {page === 'dashboard'
                      ? `Olá, ${user.name.split(' ')[0]}`
                      : nav.find((n) => n.id === page)?.label}
                  </h1>
                  <p>
                    {page === 'dashboard'
                      ? manager
                        ? 'Veja como anda a comunicação da sua instituição.'
                        : 'Confira as mensagens da sua instituição.'
                      : (
                          {
                            inbox: 'Tudo o que você precisa saber, em um só lugar.',
                            notices: 'Mensagens que conectam a sua comunidade.',
                            members: 'Cada pessoa faz parte dessa conexão.',
                            categories: 'Organize os grupos da sua instituição.',
                            invites: 'Abra as portas para sua comunidade.',
                          } as Record<string, string>
                        )[page]}
                  </p>
                </div>
                {manager && (
                  <button
                    className="primary"
                    onClick={() =>
                      openModal(
                        page === 'members' || page === 'invites'
                          ? 'invite'
                          : page === 'categories'
                            ? 'category'
                            : 'compose',
                      )
                    }
                  >
                    <Plus size={18} />
                    {page === 'members' || page === 'invites'
                      ? 'Convidar pessoa'
                      : page === 'categories'
                        ? 'Nova categoria'
                        : 'Nova notificação'}
                  </button>
                )}
              </div>
              {page === 'dashboard' && (
                <Dashboard
                  user={user}
                  notices={notices}
                  members={members}
                  onNavigate={(page) => {
                    setPage(page);
                    setFilter('all');
                    setSearch('');
                  }}
                  onOpen={openNotice}
                  onManage={openModal}
                />
              )}
              {(page === 'notices' || page === 'inbox') && (
                <section className="panel">
                  <div className="toolbar">
                    <div className="tabs">
                      {(page === 'inbox'
                        ? [
                            ['all', 'Todas'],
                            ['unread', 'Não abertas'],
                            ['pending', 'Confirmação pendente'],
                          ]
                        : [
                            ['all', 'Todas'],
                            ['published', 'Publicadas'],
                            ['draft', 'Rascunhos'],
                            ['archived', 'Arquivadas'],
                          ]
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          className={filter === id ? 'selected' : ''}
                          onClick={() => setFilter(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="search">
                      <Search size={17} />
                      <input
                        aria-label="Buscar notificações"
                        placeholder="Buscar pelo título…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <NoticeTable
                    search={search}
                    filter={filter}
                    userId={user.id}
                    onOpen={openNotice}
                    onManage={openModal}
                    items={page === 'inbox' ? mine : notices}
                    personal={page === 'inbox'}
                  />
                </section>
              )}
              {page === 'members' && manager && (
                <section className="panel">
                  <div className="panel-heading">
                    <h2>
                      Pessoas da instituição <span className="count">{people.length}</span>
                    </h2>
                  </div>
                  <p className="mobile-table-hint">Deslize a tabela para ver todas as colunas</p>
                  <div
                    className="table-wrap"
                    role="region"
                    aria-label="Pessoas da instituição"
                    tabIndex={0}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Pessoa</th>
                          <th>Categorias</th>
                          <th>Perfil</th>
                          <th>Situação</th>
                          <th>
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {people
                          .slice((currentPeoplePage - 1) * 10, currentPeoplePage * 10)
                          .map((m) => {
                            const u = data.users.find((u) => u.id === m.userId)!;
                            return (
                              <tr key={m.id}>
                                <td>
                                  <div className="person-cell">
                                    <span className="avatar">
                                      {u.name.slice(0, 2).toUpperCase()}
                                    </span>
                                    <div>
                                      <strong>{u.name}</strong>
                                      <small>{u.email}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  {m.categoryIds
                                    .map((id) => categories.find((c) => c.id === id)?.name)
                                    .filter(Boolean)
                                    .join(', ') || 'Sem categoria'}
                                </td>
                                <td>{m.role === 'manager' ? 'Gestor' : 'Usuário'}</td>
                                <td>
                                  <span
                                    className={`badge ${membershipIsActive(m) ? 'published' : 'archived'}`}
                                  >
                                    {!m.active
                                      ? 'Inativo'
                                      : membershipIsActive(m)
                                        ? 'Ativo'
                                        : 'Expirado'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="text-button"
                                    onClick={() => openModal('member', m.id)}
                                  >
                                    Gerenciar
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={currentPeoplePage}
                    pages={peoplePages}
                    setPage={setPeoplePage}
                  />
                </section>
              )}
              {page === 'categories' && manager && (
                <div className="category-grid">
                  {!categories.length ? (
                    <section className="panel">
                      <Empty
                        title="Dê um lugar a cada grupo"
                        description="Crie categorias como Professores, Famílias ou Coordenação."
                      />
                    </section>
                  ) : (
                    categories.map((c) => {
                      const Icon = categoryIcon(c.icon);
                      const color = categoryColor(c.color);
                      return (
                        <section className="panel category-card" key={c.id}>
                          <span
                            className="category-icon"
                            style={{ color, backgroundColor: `${color}20` }}
                          >
                            <Icon size={22} />
                          </span>
                          <span className="badge">{c.archived ? 'Arquivada' : 'Ativa'}</span>
                          <h2>{c.name}</h2>
                          <p>
                            {members.filter((m) => m.active && m.categoryIds.includes(c.id)).length}{' '}
                            pessoas vinculadas
                          </p>
                          <button
                            className="text-button"
                            onClick={() => openModal('category', c.id)}
                          >
                            Gerenciar categoria <ArrowUpRight size={16} />
                          </button>
                        </section>
                      );
                    })
                  )}
                </div>
              )}
              {page === 'invites' && manager && (
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Convites da instituição</h2>
                      <p>Copie o link e compartilhe manualmente. Não enviamos e-mails.</p>
                    </div>
                  </div>
                  {!invites.length ? (
                    <Empty
                      title="Sua comunidade começa com um convite"
                      description="Convide uma pessoa usando o e-mail dela."
                    />
                  ) : (
                    <>
                      <p className="mobile-table-hint">
                        Deslize a tabela para ver todas as colunas
                      </p>
                      <div
                        className="table-wrap"
                        role="region"
                        aria-label="Convites da instituição"
                        tabIndex={0}
                      >
                        <table>
                          <thead>
                            <tr>
                              <th>E-mail</th>
                              <th>Perfil</th>
                              <th>Validade</th>
                              <th>Situação</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invites
                              .slice((currentInvitePage - 1) * 10, currentInvitePage * 10)
                              .map((i) => (
                                <tr key={i.id}>
                                  <td>{i.email}</td>
                                  <td>{i.role === 'manager' ? 'Gestor' : 'Usuário'}</td>
                                  <td>{date(i.expiresAt)}</td>
                                  <td>
                                    <span className="badge">
                                      {i.used
                                        ? 'Aceito'
                                        : i.revoked
                                          ? 'Revogado'
                                          : validInvite(i)
                                            ? 'Pendente'
                                            : 'Expirado'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="inline-actions">
                                      <button
                                        className="text-button"
                                        onClick={() => openModal('invite-details', i.id)}
                                      >
                                        Detalhes
                                      </button>
                                      {validInvite(i) && (
                                        <>
                                          <button
                                            className="text-button"
                                            onClick={() =>
                                              run(async () => {
                                                await navigator.clipboard.writeText(
                                                  `${location.origin}${location.pathname}?invite=${i.id}`,
                                                );
                                                notify(
                                                  'Link copiado. Compartilhe com a pessoa convidada.',
                                                );
                                              })
                                            }
                                          >
                                            <Copy size={15} />
                                            Copiar link
                                          </button>
                                          <button
                                            className="text-button danger"
                                            onClick={() =>
                                              run(() => {
                                                manage();
                                                commit({
                                                  ...data,
                                                  invites: data.invites.map((x) =>
                                                    x.id === i.id ? { ...x, revoked: true } : x,
                                                  ),
                                                });
                                              })
                                            }
                                          >
                                            Revogar
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination
                        page={currentInvitePage}
                        pages={invitePages}
                        setPage={setInvitePage}
                      />
                    </>
                  )}
                </section>
              )}
            </>
          )}
          <footer>
            Vercia <span>Comunicação que aproxima.</span>
            <small>Dados armazenados somente neste navegador.</small>
          </footer>
        </main>
      </div>
      <NoticeEditor {...dialogProps} />
      <InvitationDialog {...dialogProps} />
      <InviteDetails {...dialogProps} />
      <CategoryDialog {...dialogProps} />
      <MemberDialog {...dialogProps} />
      <ReadingDialog {...dialogProps} />
      <NoticeReport {...dialogProps} />
      <DeleteDraftDialog {...dialogProps} />
      <ArchiveDialog {...dialogProps} />
      <AccountDialog {...dialogProps} />
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
