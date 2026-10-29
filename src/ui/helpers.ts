export const uid = () => crypto.randomUUID();
export const date = (s?: string) =>
  s ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
export const input = (f: FormData, k: string) => {
  const value = String(f.get(k) || '');
  return ['password', 'current', 'repeat'].includes(k) ? value : value.trim();
};
