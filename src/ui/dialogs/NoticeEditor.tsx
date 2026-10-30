import type { DialogProps } from './types';
import { Modal } from '../components';
import { priorities } from '../../domain/models';
import { Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { membershipIsActive } from '../../application/service';
export default function NoticeEditor({
  modal,
  manager,
  currentNotice,
  selected,
  categories,
  data,
  members,
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
  | 'data'
  | 'members'
  | 'errorBox'
  | 'busy'
  | 'close'
  | 'openModal'
  | 'saveNotice'
>) {
  const [audience, setAudience] = useState<'all' | 'categories' | 'individuals'>('all');
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (modal === 'compose') {
      setAudience(currentNotice?.audience || 'all');
      setSearch('');
    }
  }, [modal, selected]);
  const available = members.filter(
    (member) =>
      member.role === 'member' &&
      (membershipIsActive(member) || currentNotice?.recipientIds?.includes(member.userId)) &&
      data.users.some((user) => user.id === member.userId && !user.isAdministrator),
  );
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
                <select
                  name="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as typeof audience)}
                >
                  <option value="all">Toda a instituição</option>
                  <option value="categories">Categorias selecionadas</option>
                  <option value="individuals">Pessoas selecionadas</option>
                </select>
              </label>
            </div>
            <fieldset hidden={audience !== 'categories'}>
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
            <fieldset hidden={audience !== 'individuals'}>
              <legend>Selecionar pessoas</legend>
              <label>
                Buscar pessoa
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome ou e-mail"
                />
              </label>
              <div className="recipient-options">
                {available.map((member) => {
                  const person = data.users.find((user) => user.id === member.userId)!;
                  const active = membershipIsActive(member);
                  const matches = `${person.name} ${person.email}`
                    .toLocaleLowerCase()
                    .includes(search.trim().toLocaleLowerCase());
                  return (
                    <label
                      className="check-label recipient-option"
                      key={member.id}
                      hidden={!matches}
                    >
                      <input
                        type="checkbox"
                        name="recipientIds"
                        value={person.id}
                        defaultChecked={currentNotice?.recipientIds?.includes(person.id)}
                      />
                      <span>
                        <strong>{person.name}</strong>
                        <small>
                          {person.email}
                          {!active ? ' · acesso inativo' : ''}
                        </small>
                      </span>
                    </label>
                  );
                })}
                {!available.length && (
                  <p className="muted">Nenhum usuário com acesso ativo nesta instituição.</p>
                )}
                {available.length > 0 &&
                  !available.some((m) => {
                    const p = data.users.find((u) => u.id === m.userId)!;
                    return `${p.name} ${p.email}`
                      .toLocaleLowerCase()
                      .includes(search.trim().toLocaleLowerCase());
                  }) && <p className="muted">Nenhuma pessoa encontrada.</p>}
              </div>
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
