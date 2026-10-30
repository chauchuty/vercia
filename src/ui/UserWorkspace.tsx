import { Bell, ChevronRight, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { Database, Institution, Membership, Notice, User } from '../domain/models';
import { institutionTextColor } from '../domain/institution';
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
  const published = notices.filter(
    (n) => n.status === 'published' && n.receipts.some((r) => r.userId === user.id),
  );
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
    <div className="user-workspace">
      <header className="user-header">
        <div className="user-header-brand">
          <span className="user-brand-icon">
            <Bell size={18} />
          </span>
          <strong>
            vercia<span>.</span>
          </strong>
        </div>
        <ThemeToggle />
        <button className="user-account" type="button" aria-label="Minha conta" onClick={onAccount}>
          <UserRound size={19} />
        </button>
      </header>
      <main className="user-content">
        {institution && (
          <div className="user-institution">
            <span
              className="user-institution-symbol"
              style={{
                backgroundColor: institution.color,
                color: institutionTextColor(institution.color),
              }}
            >
              {institution.acronym}
            </span>
            <div>
              <small>Instituição</small>
              <strong>{institution.name}</strong>
            </div>
          </div>
        )}
        {memberships.length > 1 && (
          <label className="user-institution-select">
            Trocar instituição
            <select
              aria-label="Instituição"
              value={institution?.id || ''}
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
          </label>
        )}
        {!institution ? (
          <Empty
            title="Você precisa de um convite"
            description="Peça ao gestor o link de acesso à instituição."
          />
        ) : (
          <>
            <div className="user-title">
              <div>
                <p>Olá, {user.name.split(' ')[0]}</p>
                <h1>Notificações</h1>
              </div>
              <span>{published.length}</span>
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
                {visible.map((notice) => (
                  <li key={notice.id}>
                    <button className="personal-notice-card" onClick={() => onOpen(notice)}>
                      <PriorityIcon value={notice.priority} />
                      <strong>{notice.title}</strong>
                      <ChevronRight size={20} aria-hidden="true" />
                    </button>
                  </li>
                ))}
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
          </>
        )}
      </main>
    </div>
  );
}
