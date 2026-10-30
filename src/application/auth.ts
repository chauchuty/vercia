import type { User } from '../domain/models';
export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export async function hashPassword(password: string, salt: string) {
  if (!globalThis.crypto?.subtle) {
    throw Error('Para entrar, abra o aplicativo por HTTPS ou acesse localhost neste computador.');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 210000, hash: 'SHA-256' },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
}
export async function createUser(name: string, email: string, password: string): Promise<User> {
  if (password.length < 8) throw Error('Use uma senha de pelo menos 8 caracteres.');
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.randomUUID) {
    throw Error('Para usar o aplicativo, abra-o por HTTPS ou acesse localhost neste computador.');
  }
  const salt = crypto.randomUUID();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizeEmail(email),
    salt,
    hash: await hashPassword(password, salt),
  };
}
export async function verifyPassword(user: User, password: string) {
  return user.hash === (await hashPassword(password, user.salt));
}
