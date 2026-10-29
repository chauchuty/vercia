import type { Institution } from './models';
export const DEFAULT_INSTITUTION_COLOR = '#1c7055';
export function createInstitution(
  id: string,
  name: string,
  acronym: string,
  color: string,
): Institution {
  const normalizedAcronym = acronym.trim().toUpperCase();
  if (!name.trim()) throw Error('Informe o nome da instituição.');
  if (!/^[A-Z0-9]{4}$/.test(normalizedAcronym))
    throw Error('A sigla deve conter exatamente 4 letras ou números.');
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw Error('Selecione uma cor de referência válida.');
  return { id, name: name.trim(), acronym: normalizedAcronym, color: color.toLowerCase() };
}
export function defaultAcronym(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X');
}
export function institutionTextColor(color: string) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(color.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? '#000000' : '#ffffff';
}
