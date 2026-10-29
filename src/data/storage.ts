import { emptyDatabase, type Database } from '../domain/models';
const KEY = 'vercia.database.v1';
export function loadDatabase(): Database {
  const raw = localStorage.getItem(KEY);
  if (!raw) return emptyDatabase();
  try {
    const db = JSON.parse(raw);
    if (
      db.version !== 1 ||
      !['users', 'institutions', 'memberships', 'categories', 'invites', 'notices'].every((k) =>
        Array.isArray(db[k]),
      )
    )
      throw Error();
    return db;
  } catch {
    throw new Error(
      'Os dados locais estão inválidos. Preserve uma cópia antes de limpar o armazenamento do navegador.',
    );
  }
}
export function saveDatabase(db: Database) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    throw new Error('Não foi possível salvar. Verifique o espaço e as permissões do navegador.');
  }
}
export const session = {
  get: () => sessionStorage.getItem('vercia.session'),
  set: (id: string) => sessionStorage.setItem('vercia.session', id),
  clear: () => sessionStorage.removeItem('vercia.session'),
};
