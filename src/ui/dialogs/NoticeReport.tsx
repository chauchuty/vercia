import type { DialogProps } from './types';
import { Modal, PriorityIcon } from '../components';
import { date } from '../helpers';
import { priorities } from '../../domain/models';
import { Archive, ArchiveRestore, Pencil } from 'lucide-react';
import { Pagination, usePagination } from '../Pagination';
import NoticeConversation from '../NoticeConversation';
export default function NoticeReport({
  modal,
  manager,
  currentNotice,
  data,
  user,
  busy,
  errorBox,
  run,
  manage,
  commit,
  notify,
  close,
  openModal,
}: Pick<
  DialogProps,
  | 'modal'
  | 'manager'
  | 'currentNotice'
  | 'data'
  | 'user'
  | 'busy'
  | 'errorBox'
  | 'close'
  | 'openModal'
  | 'run'
  | 'manage'
  | 'commit'
  | 'notify'
>) {
  const pagination = usePagination(currentNotice?.receipts || [], currentNotice?.id || '');
  return (
    <>
      {modal === 'report' && currentNotice && manager && (
        <Modal title={currentNotice.title} onClose={close}>
          {errorBox}
          <div className="notice-detail-meta">
            <PriorityIcon value={currentNotice.priority} />
            <span>{priorities[currentNotice.priority]}</span>
            <span>· {date(currentNotice.publishedAt)}</span>
          </div>
          <div className="message-body">{currentNotice.body}</div>
          <h3>Acompanhamento por destinatário</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Abertura</th>
                  <th>Confirmação</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((r) => (
                  <tr key={r.userId}>
                    <td>{data.users.find((u) => u.id === r.userId)?.name}</td>
                    <td>{r.openedAt ? date(r.openedAt) : 'Não aberta'}</td>
                    <td>
                      {currentNotice.requiresConfirmation
                        ? r.confirmedAt
                          ? date(r.confirmedAt)
                          : 'Pendente'
                        : 'Não solicitada'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination {...pagination} />
          <div className="modal-actions">
            <button className="secondary" onClick={() => openModal('compose', currentNotice.id)}>
              <Pencil size={16} /> Editar notificação
            </button>
          </div>
          {currentNotice.status === 'archived' && (
            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() =>
                  run(() => {
                    manage();
                    commit({
                      ...data,
                      notices: data.notices.map((n) =>
                        n.id === currentNotice.id && n.status === 'archived'
                          ? { ...n, status: 'published' }
                          : n,
                      ),
                    });
                    close();
                    notify('Notificação desarquivada.');
                  })
                }
              >
                <ArchiveRestore size={16} /> Desarquivar notificação
              </button>
            </div>
          )}
          {currentNotice.status === 'published' && (
            <div className="modal-actions">
              <button className="secondary" onClick={() => openModal('archive', currentNotice.id)}>
                <Archive size={16} />
                Arquivar notificação
              </button>
            </div>
          )}
          {(currentNotice.revisions || []).length > 0 && (
            <details className="notice-revisions">
              <summary>Histórico de versões ({currentNotice.revisions?.length})</summary>
              {[...(currentNotice.revisions || [])].reverse().map((revision, index) => (
                <section className="notice-revision" key={`${revision.savedAt}-${index}`}>
                  <h3>{revision.title}</h3>
                  <small>
                    Versão anterior a {date(revision.savedAt)} · Prioridade{' '}
                    {priorities[revision.priority]}
                  </small>
                  <p className="revision-body">{revision.body}</p>
                  <p className="help">
                    {revision.requiresConfirmation
                      ? 'Confirmação solicitada'
                      : 'Confirmação não solicitada'}
                  </p>
                  <ul>
                    {revision.receipts.map((receipt) => (
                      <li key={receipt.userId}>
                        <strong>
                          {data.users.find((u) => u.id === receipt.userId)?.name || 'Usuário'}
                        </strong>{' '}
                        · Abertura: {receipt.openedAt ? date(receipt.openedAt) : 'Não aberta'} ·
                        Confirmação:{' '}
                        {revision.requiresConfirmation
                          ? receipt.confirmedAt
                            ? date(receipt.confirmedAt)
                            : 'Pendente'
                          : 'Não solicitada'}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </details>
          )}
          <NoticeConversation
            data={data}
            notice={currentNotice}
            user={user}
            manager
            busy={busy}
            run={run}
            commit={commit}
          />
        </Modal>
      )}
    </>
  );
}
