import type { DialogProps } from './types';
import { Modal, PriorityIcon } from '../components';
import { date } from '../helpers';
import { priorities } from '../../domain/models';
import { Archive } from 'lucide-react';
export default function NoticeReport({
  modal,
  manager,
  currentNotice,
  data,
  errorBox,
  close,
  openModal,
}: Pick<
  DialogProps,
  'modal' | 'manager' | 'currentNotice' | 'data' | 'errorBox' | 'close' | 'openModal'
>) {
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
                {currentNotice.receipts.map((r) => (
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
          {currentNotice.status === 'published' && (
            <div className="modal-actions">
              <button className="secondary" onClick={() => openModal('archive', currentNotice.id)}>
                <Archive size={16} />
                Arquivar notificação
              </button>
            </div>
          )}
          <p className="help">Os destinatários foram fixados no momento da publicação.</p>
        </Modal>
      )}
    </>
  );
}
