import type { DialogProps } from './types';
import { Modal } from '../components';
import { uid, input } from '../helpers';
import { categoryIcons, categoryColor, type CategoryIconName } from '../categoryIcons';
export default function CategoryDialog({
  modal,
  manager,
  selected,
  data,
  inst,
  categories,
  errorBox,
  busy,
  run,
  manage,
  commit,
  close,
  notify,
}: Pick<
  DialogProps,
  | 'modal'
  | 'manager'
  | 'selected'
  | 'data'
  | 'inst'
  | 'categories'
  | 'errorBox'
  | 'busy'
  | 'run'
  | 'manage'
  | 'commit'
  | 'close'
  | 'notify'
>) {
  return (
    <>
      {modal === 'category' && manager && (
        <Modal title={selected ? 'Gerenciar categoria' : 'Nova categoria'} onClose={close}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(() => {
                manage();
                const name = input(f, 'name');
                if (!name) throw Error('Informe o nome.');
                if (
                  categories.some(
                    (c) => c.id !== selected && c.name.toLowerCase() === name.toLowerCase(),
                  )
                )
                  throw Error('Já existe uma categoria com este nome.');
                const c = {
                  id: selected || uid(),
                  institutionId: inst,
                  name,
                  archived: f.has('archived'),
                  icon: Object.hasOwn(categoryIcons, input(f, 'icon')) ? input(f, 'icon') : 'tags',
                  color: categoryColor(input(f, 'color')),
                };
                commit({
                  ...data,
                  categories: selected
                    ? data.categories.map((x) => (x.id === selected ? c : x))
                    : [...data.categories, c],
                });
                close();
                notify('Categoria salva.');
              });
            }}
          >
            {errorBox}
            <label>
              Nome da categoria
              <input
                name="name"
                required
                defaultValue={categories.find((c) => c.id === selected)?.name}
                placeholder="Ex.: Professores"
              />
            </label>
            <fieldset className="category-icon-picker">
              <legend>Ícone da categoria</legend>
              <div className="category-icon-options">
                {(Object.keys(categoryIcons) as CategoryIconName[]).map((key) => {
                  const { icon: Icon, label } = categoryIcons[key];
                  const existing = categories.find((c) => c.id === selected)?.icon;
                  const chosen =
                    existing && Object.hasOwn(categoryIcons, existing) ? existing : 'tags';
                  return (
                    <label key={key} className="category-icon-option" title={label}>
                      <input type="radio" name="icon" value={key} defaultChecked={chosen === key} />
                      <span>
                        <Icon size={20} />
                        <span className="sr-only">{label}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <label>
              Cor da categoria
              <input
                type="color"
                name="color"
                className="color-picker"
                defaultValue={categoryColor(categories.find((c) => c.id === selected)?.color)}
              />
            </label>
            {selected && (
              <label className="check-label">
                <input
                  type="checkbox"
                  name="archived"
                  defaultChecked={categories.find((c) => c.id === selected)?.archived}
                />
                Arquivar categoria
              </label>
            )}
            <p className="help">
              Associe as pessoas às categorias na tela Pessoas. Arquivar não altera notificações já
              publicadas.
            </p>
            <button className="primary" disabled={busy}>
              Salvar categoria
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
