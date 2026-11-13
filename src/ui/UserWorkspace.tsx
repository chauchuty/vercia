import { Bell, ChevronRight, UserRound, Home, MessageSquareText, Building2 } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import type { Database, Institution, Membership, Notice, User } from '../domain/models';
import { getInstitutionTheme } from '../domain/themes';
import { Empty, PriorityIcon } from './components';
import ThemeToggle from './ThemeToggle';

type Filter = 'all' | 'unread' | 'pending';
interface Props {
  user: User;
  data: Database;
  institution: Institution | undefined;
  memberships: Membership[];
  notices: Notice[];
  onInstitutionChange: (id: string) => void;
  onOpen: (notice: Notice) => void;
  onAccount: () => void;
}
export default function UserWorkspace({
  user,
  data,
  institution,
  memberships,
  notices,
  onInstitutionChange,
  onOpen,
  onAccount,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const theme = getInstitutionTheme(institution?.theme);
  const style = {
    '--accent': theme.color,
    '--theme-pale': theme.pale,
    '--sprite-x': `${((theme.index % 4) * 100) / 3}%`,
    '--sprite-y': `${Math.floor(theme.index / 4) * 50}%`,
  } as CSSProperties;
  const published = notices.filter(
    (n) => n.status === 'published' && n.receipts.some((r) => r.userId === user.id),
  );
  const pending = published.filter(
    (n) => n.requiresConfirmation && !n.receipts.find((r) => r.userId === user.id)?.confirmedAt,
  ).length;
  const visible = published
    .filter((n) => {
      const receipt = n.receipts.find((r) => r.userId === user.id);
      return (
        filter === 'all' ||
        (filter === 'unread' ? !receipt?.openedAt : n.requiresConfirmation && !receipt?.confirmedAt)
      );
    })
    .sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt));
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'unread', label: 'Não lidas' },
    { id: 'pending', label: 'Pendentes' },
  ];
  return (
    <div className="user-workspace pixel-workspace" style={style}>
      <header className="user-header pixel-header">
        <div className="pixel-logo">
          <span>V</span>ERCIA
        </div>
        <ThemeToggle />
        <button className="user-account" type="button" aria-label="Minha conta" onClick={onAccount}>
          <UserRound size={20} />
        </button>
      </header>
      <main className="user-content pixel-content">
        {institution && (
          <div className="pixel-institution">
            <Building2 size={17} />
            {memberships.length > 1 ? (
              <select
                aria-label="Instituição"
                value={institution.id}
                onChange={(e) => {
                  setFilter('all');
                  onInstitutionChange(e.target.value);
                }}
              >
                {memberships.map((m) => (
                  <option key={m.id} value={m.institutionId}>
                    {data.institutions.find((i) => i.id === m.institutionId)?.name}
                  </option>
                ))}
              </select>
            ) : (
              <strong>{institution.name}</strong>
            )}
          </div>
        )}
        {!institution ? (
          <Empty
            title="Você precisa de um convite"
            description="Peça ao gestor o link de acesso à instituição."
          />
        ) : (
          <>
            <section className="pixel-hero">
              <div>
                <p>Olá, {user.name.split(' ')[0]}</p>
                <button className="pixel-pending" onClick={() => setFilter('pending')}>
                  <Bell size={15} />
                  {pending} {pending === 1 ? 'ciência pendente' : 'ciências pendentes'}
                </button>
              </div>
              <div className="pixel-art" role="img" aria-label={`Ilustração: ${theme.label}`} />
            </section>
            <div className="pixel-section">
              <h1>Mensagens</h1>
              <span>
                {published.length} {published.length === 1 ? 'mensagem' : 'mensagens'}
              </span>
            </div>
            <div className="user-filters" role="group" aria-label="Filtrar notificações">
              {filters.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={filter === option.id ? 'selected' : ''}
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {visible.length ? (
              <ul className="personal-notice-list">
                {visible.map((notice) => {
                  const receipt = notice.receipts.find((r) => r.userId === user.id);
                  return (
                    <li key={notice.id}>
                      <button className="personal-notice-card" onClick={() => onOpen(notice)}>
                        <PriorityIcon value={notice.priority} />
                        <span className="pixel-notice-text">
                          <strong>{notice.title}</strong>
                          {notice.requiresConfirmation && !receipt?.confirmedAt && (
                            <small>Ciência pendente</small>
                          )}
                          {!receipt?.openedAt && <small>Não lida</small>}
                        </span>
                        <ChevronRight size={20} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="user-empty">
                <Bell size={22} />
                <strong>
                  {filter === 'all'
                    ? 'Nenhuma notificação por enquanto'
                    : 'Nenhuma notificação nesta lista'}
                </strong>
                <p>
                  {filter === 'all'
                    ? 'As mensagens da sua instituição aparecerão aqui.'
                    : 'Escolha outro filtro para ver suas mensagens.'}
                </p>
              </div>
            )}
            <div className="pixel-landscape" aria-hidden="true">
              <div />
            </div>
          </>
        )}
      </main>
      <nav className="pixel-bottom" aria-label="Navegação principal">
        <button
          className="active"
          onClick={() => {
            setFilter('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Home size={21} />
          <span>Início</span>
        </button>
        <button
          onClick={() => {
            setFilter('all');
            document.querySelector('.pixel-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <MessageSquareText size={21} />
          <span>Mensagens</span>
        </button>
        <button onClick={onAccount}>
          <UserRound size={21} />
          <span>Conta</span>
        </button>
      </nav>
    </div>
  );
}
