import type { DialogProps } from './types';
import { Modal } from '../components';
import { priorities } from '../../domain/models';
import { Send, Trash2 } from 'lucide-react';
export default function NoticeEditor({
  modal,
  manager,
  currentNotice,
  selected,
  categories,
  errorBox,
  busy,
  close,
  openModal,
  saveNotice,
}: Pick<
  DialogProps,
  | 'modal'
  | 'manager'
  | 'currentNotice'
  | 'selected'
  | 'categories'
  | 'errorBox'
  | 'busy'
  | 'close'
  | 'openModal'
  | 'saveNotice'
>) {
  return (
    <>
      {modal === 'compose' && manager && (
        <Modal title={selected ? 'Editar rascunho' : 'Nova notificação'} onClose={close}>
          <form onSubmit={saveNotice}>
            {errorBox}
            <label>
              Título
              <input
                name="title"
                required
                maxLength={160}
                defaultValue={currentNotice?.title}
                placeholder="Sobre o que vamos conversar?"
              />
            </label>
            <label>
              Mensagem
              <textarea
                name="body"
                required
                rows={6}
                defaultValue={currentNotice?.body}
                placeholder="Escreva uma mensagem clara para sua comunidade…"
              />
            </label>
            <div className="form-grid">
              <label>
                Prioridade
                <select name="priority" defaultValue={currentNotice?.priority || 'medium'}>
                  {Object.entries(priorities).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Destinatários
                <select name="audience" defaultValue={currentNotice?.audience || 'all'}>
                  <option value="all">Toda a instituição</option>
                  <option value="categories">Categorias selecionadas</option>
                </select>
              </label>
            </div>
            <fieldset>
              <legend>
                Categorias <small>Usadas apenas ao selecionar categorias acima</small>
              </legend>
              {categories
                .filter((c) => !c.archived)
                .map((c) => (
                  <label className="check-label" key={c.id}>
                    <input
                      type="checkbox"
                      name="categories"
                      value={c.id}
                      defaultChecked={currentNotice?.categoryIds.includes(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              {!categories.some((c) => !c.archived) && (
                <p className="muted">Nenhuma categoria ativa.</p>
              )}
            </fieldset>
            <label className="check-label confirmation-option">
              <input
                name="confirmation"
                type="checkbox"
                defaultChecked={currentNotice?.requiresConfirmation}
              />
              <span>
                <strong>Solicitar confirmação de ciência</strong>
                <small>Além de abrir, a pessoa precisa confirmar que leu.</small>
              </span>
            </label>
            <p className="help">Após a publicação, a mensagem e os destinatários ficam fixos.</p>
            {selected && (
              <button
                type="button"
                className="text-button danger"
                onClick={() => openModal('deleteDraft', selected)}
              >
                <Trash2 size={15} />
                Excluir rascunho
              </button>
            )}
            <div className="modal-actions">
              <button type="submit" className="secondary" value="draft" disabled={busy}>
                Salvar rascunho
              </button>
              <button type="submit" className="primary" value="publish" disabled={busy}>
                <Send size={16} />
                Publicar notificação
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
