import type { DialogProps } from './types';
import { Modal } from '../components';
export default function DeleteDraftDialog({
  modal,
  manager,
  currentNotice,
  selected,
  data,
  errorBox,
  run,
  manage,
  commit,
  close,
  notify,
}: Pick<
  DialogProps,
  | 'modal'
  | 'manager'
  | 'currentNotice'
  | 'selected'
  | 'data'
  | 'errorBox'
  | 'run'
  | 'manage'
  | 'commit'
  | 'close'
  | 'notify'
>) {
  return (
    <>
      {modal === 'deleteDraft' && currentNotice && manager && (
        <Modal title="Excluir rascunho?" onClose={close}>
          <p>O rascunho “{currentNotice.title}” será excluído.</p>
          {errorBox}
          <div className="modal-actions">
            <button className="secondary" onClick={close}>
              Cancelar
            </button>
            <button
              className="primary"
              onClick={() =>
                run(() => {
                  manage();
                  if (currentNotice.status !== 'draft')
                    throw Error('Somente rascunhos podem ser excluídos.');
                  commit({ ...data, notices: data.notices.filter((n) => n.id !== selected) });
                  close();
                  notify('Rascunho excluído.');
                })
              }
            >
              Excluir rascunho
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
