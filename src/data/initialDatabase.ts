import { emptyDatabase, type Database } from '../domain/models';
/** Only the local bootstrap account is seeded; all institution data starts empty. */
export function initialDatabase(): Database {
  return {
    ...emptyDatabase(),
    users: [
      {
        id: 'vercia-administrator',
        name: 'Administrador',
        email: 'administrador@vercia.local',
        isAdministrator: true,
        salt: 'vercia-initial-administrator-v1',
        hash: 'f135295db4a57910bdb7e4780a3b3933b1ab6e613d6e1e2ed57a55c8305d77bd',
      },
    ],
  };
}
