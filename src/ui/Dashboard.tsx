import { Send, Users, Eye, Clock, ArrowUpRight } from 'lucide-react';
import type { Notice, Membership, User } from '../domain/models';
import { membershipIsActive } from '../application/service';
import NoticeTable from './NoticeTable';

interface Props {
  user: User;
  notices: Notice[];
  members: Membership[];
  onNavigate: (page: string) => void;
  onOpen: (notice: Notice) => void;
  onManage: (kind: string, id: string) => void;
}
export default function Dashboard({ user, notices, members, onNavigate, onOpen, onManage }: Props) {
  const published = notices.filter((notice) => notice.status === 'published');
  const receiptTotal = published.reduce((total, notice) => total + notice.receipts.length, 0);
  const openedTotal = published.reduce(
    (total, notice) => total + notice.receipts.filter((receipt) => receipt.openedAt).length,
    0,
  );
  const stats = [
    {
      label: 'Notificações publicadas',
      value: published.length,
      icon: Send,
      foot: 'Mensagens em circulação',
      tone: 'green',
    },
    {
      label: 'Pessoas na instituição',
      value: members.filter((member) => member.userId !== user.id && membershipIsActive(member))
        .length,
      icon: Users,
      foot: 'Pessoas com acesso',
      tone: 'blue',
    },
    {
      label: 'Taxa de abertura',
      value: `${receiptTotal ? Math.round((openedTotal / receiptTotal) * 100) : 0}%`,
      icon: Eye,
      foot: `${openedTotal} de ${receiptTotal} entregas abertas`,
      tone: 'purple',
    },
    {
      label: 'Confirmações pendentes',
      value: published.reduce(
        (total, notice) =>
          total +
          (notice.requiresConfirmation
            ? notice.receipts.filter((receipt) => !receipt.confirmedAt).length
            : 0),
        0,
      ),
      icon: Clock,
      foot: 'Aguardando ciência dos usuários',
      tone: 'orange',
    },
  ];
  return (
    <>
      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat" key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <span className={`stat-icon ${stat.tone}`}>
                <stat.icon size={19} />
              </span>
            </div>
            <strong>{stat.value}</strong>
            <small>{stat.foot}</small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Últimas notificações</h2>
              <p>A comunicação da escola acontece aqui.</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('notices')}>
              Ver todas <ArrowUpRight size={16} />
            </button>
          </div>
          <NoticeTable
            search=""
            filter="all"
            userId={user.id}
            onOpen={onOpen}
            onManage={onManage}
            items={[...published]
              .sort((a, b) =>
                (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt),
              )
              .slice(0, 5)}
          />
        </section>
      </div>
    </>
  );
}
