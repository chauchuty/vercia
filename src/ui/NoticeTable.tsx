import { ChevronRight } from 'lucide-react';
import type { Notice } from '../domain/models';
import { PriorityIcon, Empty } from './components';
import { Pagination, usePagination } from './Pagination';
const day = (s: string) =>
  new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
export default function NoticeTable({
  items,
  personal = false,
  search,
  filter,
  userId,
  onOpen,
  onManage,
}: {
  items: Notice[];
  personal?: boolean;
  search: string;
  filter: string;
  userId: string;
  onOpen: (notice: Notice) => void;
  onManage: (kind: string, id: string) => void;
}) {
  const visible = items
    .filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) &&
        (filter === 'all' ||
          (personal
            ? filter === 'unread'
              ? !n.receipts.find((r) => r.userId === userId)?.openedAt
              : n.requiresConfirmation && !n.receipts.find((r) => r.userId === userId)?.confirmedAt
            : n.status === filter)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pagination = usePagination(visible, `${search}:${filter}`);
  return (
    <>
      {!visible.length ? (
        <Empty
          title="Tudo tranquilo por aqui"
          description={
            search
              ? 'Nenhuma notificação corresponde à busca.'
              : 'As notificações aparecerão aqui quando forem publicadas.'
          }
        />
      ) : (
        <div className="notice-list">
          {pagination.items.map((n) => {
            const read = n.receipts.find((r) => r.userId === userId);
            return (
              <div className="notice-row" key={n.id}>
                <button
                  className="notice-main"
                  onClick={() =>
                    personal
                      ? onOpen(n)
                      : onManage(n.status === 'draft' ? 'compose' : 'report', n.id)
                  }
                >
                  <PriorityIcon value={n.priority} />
                  <div>
                    <strong>{n.title}</strong>
                    {!personal && (
                      <small>
                        {n.status === 'draft' ? 'Rascunho' : `${n.receipts.length} destinatários`}
                        <span>·</span>
                        {day(n.createdAt)}
                        {(n.messages || []).some(
                          (message) => message.authorId === message.threadUserId,
                        ) && (
                          <>
                            <span>·</span>
                            {
                              new Set(
                                (n.messages || [])
                                  .filter((message) => message.authorId === message.threadUserId)
                                  .map((message) => message.threadUserId),
                              ).size
                            }{' '}
                            conversa(s)
                          </>
                        )}
                      </small>
                    )}
                  </div>
                  {personal ? (
                    <ChevronRight size={18} />
                  ) : (
                    <span className={`badge ${n.status}`}>
                      {n.status === 'draft'
                        ? 'Rascunho'
                        : n.status === 'archived'
                          ? 'Arquivada'
                          : 'Publicada'}
                    </span>
                  )}
                </button>
                {!personal && (
                  <span className="row-metric">
                    {n.status !== 'draft'
                      ? `${n.receipts.filter((r) => r.openedAt).length}/${n.receipts.length} aberturas`
                      : 'Não enviada'}
                  </span>
                )}
                {personal && (
                  <span className="sr-only">{read?.openedAt ? 'Aberta' : 'Não aberta'}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Pagination {...pagination} />
    </>
  );
}
