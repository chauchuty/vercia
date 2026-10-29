import { describe, it, expect } from 'vitest';
import { createInstitution } from './institution';
describe('Identidade da instituição', () => {
  it('normaliza sigla e cor e preserva os dados informados', () => {
    expect(createInstitution('id', ' Colégio Horizonte ', 'chor', '#AABBCC')).toEqual({
      id: 'id',
      name: 'Colégio Horizonte',
      acronym: 'CHOR',
      color: '#aabbcc',
    });
  });
  it('exige exatamente quatro caracteres alfanuméricos', () => {
    for (const acronym of ['', 'ABC', 'ABCDE', 'A B1', 'A-12'])
      expect(() => createInstitution('id', 'Colégio', acronym, '#123456')).toThrow(
        '4 letras ou números',
      );
    expect(createInstitution('id', 'Colégio', 'C123', '#123456').acronym).toBe('C123');
  });
  it('rejeita cores que não sejam hexadecimais completas', () => {
    for (const color of ['red', '#fff', '#zzzzzz', ''])
      expect(() => createInstitution('id', 'Colégio', 'COLE', color)).toThrow('cor');
  });
});
