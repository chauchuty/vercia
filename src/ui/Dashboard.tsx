import {
  Send,
  Users,
  Eye,
  Clock,
  Bell,
  Mail,
  ArrowUpRight,
  Tags,
  ChevronRight,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import type { Notice, Membership, User } from '../domain/models';
import NoticeTable from './NoticeTable';
interface Props {
  user: User;
  manager: boolean;
  notices: Notice[];
  members: Membership[];
  onCompose: () => void;
  onInvite: () => void;
  onNavigate: (page: string) => void;
  onOpen: (notice: Notice) => void;
  onManage: (kind: string, id: string) => void;
  onAccount: () => void;
}
export default function Dashboard({
  user,
  manager,
  notices,
  members,
  onCompose,
  onInvite,
  onNavigate,
  onOpen,
  onManage,
  onAccount,
}: Props) {
  const published = notices.filter((n) => n.status === 'published');
  const mine = published.filter((n) => n.receipts.some((r) => r.userId === user.id));
  const unread = mine.filter((n) => !n.receipts.find((r) => r.userId === user.id)?.openedAt);
  const pending = mine.filter(
    (n) => n.requiresConfirmation && !n.receipts.find((r) => r.userId === user.id)?.confirmedAt,
  );
  const receiptTotal = published.reduce((a, n) => a + n.receipts.length, 0);
  const openedTotal = published.reduce(
    (a, n) => a + n.receipts.filter((r) => r.openedAt).length,
    0,
  );
  const percent = receiptTotal ? Math.round((openedTotal / receiptTotal) * 100) : 0;
  return (
    <>
      <div className="stats-grid">
        {(manager
          ? [
              {
                label: 'Notificações publicadas',
                value: published.length,
                icon: Send,
                foot: 'Mensagens em circulação',
                tone: 'green',
              },
              {
                label: 'Pessoas na instituição',
                value: members.filter((m) => m.active).length,
                icon: Users,
                foot: 'Conectadas à sua comunidade',
                tone: 'blue',
              },
              {
                label: 'Taxa de abertura',
                value: `${percent}%`,
                icon: Eye,
                foot: `${openedTotal} de ${receiptTotal} entregas abertas`,
                tone: 'purple',
              },
              {
                label: 'Confirmações pendentes',
                value: published.reduce(
                  (a, n) =>
                    a +
                    (n.requiresConfirmation ? n.receipts.filter((r) => !r.confirmedAt).length : 0),
                  0,
                ),
                icon: Clock,
                foot: 'Aguardando ciência dos usuários',
                tone: 'orange',
              },
            ]
          : [
              {
                label: 'Notificações recebidas',
                value: mine.length,
                icon: Bell,
                foot: 'Destinadas a você',
                tone: 'green',
              },
              {
                label: 'Ainda não abertas',
                value: unread.length,
                icon: Mail,
                foot: 'Fique por dentro',
                tone: 'blue',
              },
              {
                label: 'Confirmações pendentes',
                value: pending.length,
                icon: Clock,
                foot: 'Precisam da sua atenção',
                tone: 'orange',
              },
            ]
        ).map((s) => (
          <article className="stat" key={s.label}>
            <div>
              <span>{s.label}</span>
              <span className={`stat-icon ${s.tone}`}>
                <s.icon size={19} />
              </span>
            </div>
            <strong>{s.value}</strong>
            <small>{s.foot}</small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{manager ? 'Últimas notificações' : 'Suas notificações'}</h2>
              <p>A comunicação da escola acontece aqui.</p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                onNavigate(manager ? 'notices' : 'inbox');
              }}
            >
              Ver todas <ArrowUpRight size={16} />
            </button>
          </div>
          <NoticeTable
            search=""
            filter="all"
            userId={user.id}
            onOpen={onOpen}
            onManage={onManage}
            items={(manager ? published : mine).slice(-5)}
            personal={!manager}
          />
        </section>
        <aside className="right-column">
          <section className="welcome-card">
            <span className="decor-circle" />
            <span className="eyebrow">MAIS PROXIMIDADE</span>
            <h2>
              Uma comunidade <br />
              bem informada <br />
              vai mais longe.
            </h2>
            <p>
              {manager
                ? 'Mantenha todos por perto. Compartilhe o próximo aviso com a sua instituição.'
                : 'Acompanhe os avisos e participe da vida da sua instituição.'}
            </p>
            <button onClick={() => (manager ? onCompose() : onNavigate('inbox'))}>
              {manager ? 'Criar uma notificação' : 'Abrir minha caixa'}
              <ArrowUpRight size={18} />
            </button>
          </section>
          <section className="panel quick-panel">
            <h3>{manager ? 'Acesso rápido' : 'Sua conta'}</h3>
            {manager ? (
              <>
                <button onClick={() => onInvite()}>
                  <span>
                    <Users size={18} />
                    Convidar pessoas
                  </span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => {
                    onNavigate('categories');
                  }}
                >
                  <span>
                    <Tags size={18} />
                    Organizar categorias
                  </span>
                  <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <button onClick={() => onAccount()}>
                <span>
                  <Settings size={18} />
                  Alterar senha
                </span>
                <ChevronRight size={16} />
              </button>
            )}
          </section>
        </aside>
      </div>
      <div className="bottom-note">
        <ShieldCheck size={16} />
        Uma comunicação clara fortalece os vínculos da sua comunidade.
      </div>
    </>
  );
}
