import { DEFAULT_INSTITUTION_COLOR, defaultAcronym } from '../domain/institution';
import type { Database } from '../domain/models';
import { initialDatabase } from './initialDatabase';
export const DATABASE_KEY = 'vercia.database.v2';
export function loadDatabase(): Database {
  const raw = localStorage.getItem(DATABASE_KEY);
  if (!raw) {
    const db = initialDatabase();
    saveDatabase(db);
    // The requested clean start replaces the previous local dataset once.
    localStorage.removeItem('vercia.database.v1');
    session.clear();
    return db;
  }
  try {
    const db = JSON.parse(raw);
    if (
      db.version !== 2 ||
      !['users', 'institutions', 'memberships', 'categories', 'invites', 'notices'].every((k) =>
        Array.isArray(db[k]),
      )
    )
      throw Error();
    // Extend existing institutions without resetting local records.
    let changed = false;
    db.institutions = db.institutions.map((institution: Database['institutions'][number]) => {
      if (institution.acronym && institution.color) return institution;
      changed = true;
      return {
        ...institution,
        acronym: institution.acronym || defaultAcronym(institution.name),
        color: institution.color || DEFAULT_INSTITUTION_COLOR,
      };
    });
    if (changed) saveDatabase(db);
    return db;
  } catch {
    throw new Error(
      'Os dados locais estão inválidos. Preserve uma cópia antes de limpar o armazenamento do navegador.',
    );
  }
}
export function saveDatabase(db: Database) {
  try {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(db));
  } catch {
    throw new Error('Não foi possível salvar. Verifique o espaço e as permissões do navegador.');
  }
}
export const session = {
  get: () => sessionStorage.getItem('vercia.session'),
  set: (id: string) => sessionStorage.setItem('vercia.session', id),
  clear: () => sessionStorage.removeItem('vercia.session'),
};
