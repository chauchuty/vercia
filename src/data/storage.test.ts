import { beforeEach, describe, it, expect, vi } from 'vitest';
import { DATABASE_KEY, loadDatabase, saveDatabase, session } from './storage';
import { verifyPassword } from '../application/auth';
function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}
beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
});
describe('Inicialização limpa', () => {
  it('cria somente o Administrador e nenhuma instituição ou registro operacional', async () => {
    const db = loadDatabase();
    expect(db.users).toHaveLength(1);
    expect(db.users[0]).toMatchObject({
      name: 'Administrador',
      email: 'administrador@vercia.local',
      isAdministrator: true,
    });
    for (const key of ['institutions', 'memberships', 'categories', 'invites', 'notices'] as const)
      expect(db[key]).toEqual([]);
    expect(await verifyPassword(db.users[0], 'Administrador123!')).toBe(true);
    expect(await verifyPassword(db.users[0], 'senha-incorreta')).toBe(false);
  });
  it('remove dados antigos e encerra a sessão anterior na atualização', () => {
    localStorage.setItem('vercia.database.v1', JSON.stringify({ users: [{ id: 'old' }] }));
    session.set('old');
    loadDatabase();
    expect(localStorage.getItem('vercia.database.v1')).toBeNull();
    expect(session.get()).toBeNull();
    expect(localStorage.getItem(DATABASE_KEY)).toBeTruthy();
  });
  it('preserva os dados novos e a sessão ao reabrir', () => {
    const db = loadDatabase();
    db.institutions.push({ id: 'new', name: 'Minha instituição' });
    db.users[0].hash = 'changed';
    saveDatabase(db);
    session.set(db.users[0].id);
    expect(loadDatabase()).toEqual(db);
    expect(session.get()).toBe(db.users[0].id);
  });
});
