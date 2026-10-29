import type { DialogProps } from './types';
import { Modal, PriorityIcon } from '../components';
import { date } from '../helpers';
import { priorities } from '../../domain/models';
import { recordReceipt } from '../../application/service';
import { Check, ShieldCheck, CheckCheck } from 'lucide-react';
export default function ReadingDialog({
  modal,
  currentNotice,
  data,
  user,
  errorBox,
  busy,
  run,
  commit,
  close,
  notify,
}: Pick<
  DialogProps,
  | 'modal'
  | 'currentNotice'
  | 'data'
  | 'user'
  | 'errorBox'
  | 'busy'
  | 'run'
  | 'commit'
  | 'close'
  | 'notify'
>) {
  return (
    <>
      {modal === 'read' && currentNotice && (
        <Modal title={currentNotice.title} onClose={close}>
          {errorBox}
          <div className="notice-detail-meta">
            <PriorityIcon value={currentNotice.priority} />
            <span>Prioridade {priorities[currentNotice.priority]}</span>
            <span>· {date(currentNotice.publishedAt)}</span>
          </div>
          <div className="message-body">{currentNotice.body}</div>
          {(() => {
            const receipt = currentNotice.receipts.find((r) => r.userId === user.id);
            return (
              <div className="receipt-box">
                <p>
                  <CheckCheck size={17} />
                  Abertura registrada em {date(receipt?.openedAt)}
                </p>
                {currentNotice.requiresConfirmation &&
                  (receipt?.confirmedAt ? (
                    <p className="success">
                      <ShieldCheck size={18} />
                      Ciência confirmada em {date(receipt.confirmedAt)}
                    </p>
                  ) : (
                    <>
                      <p>Esta mensagem exige sua confirmação de ciência.</p>
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() =>
                          run(() => {
                            commit(recordReceipt(data, user.id, currentNotice.id, true));
                            notify('Confirmação registrada.');
                          })
                        }
                      >
                        <Check size={17} />
                        Li e estou ciente
                      </button>
                    </>
                  ))}
              </div>
            );
          })()}
        </Modal>
      )}
    </>
  );
}
