import type { DialogProps } from './types';
import { Modal } from '../components';
export default function ArchiveDialog({
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
      {modal === 'archive' && currentNotice && manager && (
        <Modal title="Arquivar notificação?" onClose={close}>
          <p>
            A mensagem “{currentNotice.title}” sairá da caixa dos usuários. As aberturas e
            confirmações continuarão disponíveis para consulta pelo gestor.
          </p>
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
                  commit({
                    ...data,
                    notices: data.notices.map((n) =>
                      n.id === selected ? { ...n, status: 'archived' } : n,
                    ),
                  });
                  close();
                  notify('Notificação arquivada.');
                })
              }
            >
              Arquivar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
