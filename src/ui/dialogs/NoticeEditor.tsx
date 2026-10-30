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
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  useEffect(() => {
    if (modal === 'compose') {
      setAudience(currentNotice?.audience || 'all');
      setSearch('');
      setSelectedPeople(currentNotice?.recipientIds || []);
    }
  }, [modal, selected]);
  const available = members
    .filter(
      (member) =>
        member.role === 'member' &&
        (membershipIsActive(member) || currentNotice?.recipientIds?.includes(member.userId)) &&
        data.users.some((user) => user.id === member.userId && !user.isAdministrator),
    )
    .sort((a, b) =>
      (data.users.find((user) => user.id === a.userId)?.name || '').localeCompare(
        data.users.find((user) => user.id === b.userId)?.name || '',
        'pt-BR',
      ),
    );
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  const query = normalize(search.trim());
  return (
    <>
      {modal === 'compose' && manager && (
        <Modal
          title={
            selected
              ? currentNotice?.status === 'draft'
                ? 'Editar rascunho'
                : 'Editar notificação'
              : 'Nova notificação'
          }
          onClose={close}
        >
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
                .filter((c) => !c.archived || currentNotice?.categoryIds.includes(c.id))
                .map((c) => (
                  <label className="check-label" key={c.id}>
                    <input
                      type="checkbox"
                      name="categories"
                      value={c.id}
                      defaultChecked={currentNotice?.categoryIds.includes(c.id)}
                    />
                    {c.name}
                    {c.archived ? ' · arquivada' : ''}
                  </label>
                ))}
              {!categories.some((c) => !c.archived) && (
                <p className="muted">Nenhuma categoria ativa.</p>
              )}
            </fieldset>
            <fieldset className="recipient-picker" hidden={audience !== 'individuals'}>
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
              <p className="recipient-selection-count" role="status">
                {selectedPeople.length === 1
                  ? '1 pessoa selecionada'
                  : `${selectedPeople.length} pessoas selecionadas`}
              </p>
              <div className="recipient-options">
                {available.map((member) => {
                  const person = data.users.find((user) => user.id === member.userId)!;
                  const active = membershipIsActive(member);
                  const matches = normalize(`${person.name} ${person.email}`).includes(query);
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
                        checked={selectedPeople.includes(person.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedPeople((ids) =>
                            checked ? [...ids, person.id] : ids.filter((id) => id !== person.id),
                          );
                        }}
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
                    return normalize(`${p.name} ${p.email}`).includes(query);
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
            <p className="help">
              {currentNotice && currentNotice.status !== 'draft'
                ? 'Alterações no conteúdo exigem nova leitura e confirmação. O histórico anterior será preservado.'
                : 'Você poderá editar a notificação após a publicação.'}
            </p>
            {selected && currentNotice?.status === 'draft' && (
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
              {(!currentNotice || currentNotice.status === 'draft') && (
                <button type="submit" className="secondary" value="draft" disabled={busy}>
                  Salvar rascunho
                </button>
              )}
              <button type="submit" className="primary" value="publish" disabled={busy}>
                <Send size={16} />
                {currentNotice && currentNotice.status !== 'draft'
                  ? 'Salvar alterações'
                  : 'Publicar notificação'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
