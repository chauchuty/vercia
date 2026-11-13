export const institutionThemes = [
  { id: 'education', label: 'Educação', color: '#1768c5', pale: '#e9f6ff', index: 0 },
  { id: 'military', label: 'Organização militar', color: '#486c27', pale: '#f2f5e5', index: 1 },
  { id: 'commerce', label: 'Comércio e serviços', color: '#bd4e20', pale: '#fff2e4', index: 2 },
  { id: 'corporate', label: 'Empresa e escritório', color: '#234b80', pale: '#edf3fb', index: 3 },
  { id: 'government', label: 'Órgão público', color: '#305c9d', pale: '#edf4ff', index: 4 },
  { id: 'health', label: 'Clínica e hospital', color: '#167a75', pale: '#e8f8f5', index: 5 },
  { id: 'residential', label: 'Condomínio', color: '#247888', pale: '#e8f7f8', index: 6 },
  { id: 'nonprofit', label: 'Associação e ONG', color: '#4b7a39', pale: '#eef8e9', index: 7 },
  {
    id: 'religious',
    label: 'Igreja e comunidade religiosa',
    color: '#765897',
    pale: '#f7efff',
    index: 8,
  },
  { id: 'sports', label: 'Clube e academia', color: '#b45819', pale: '#fff1e6', index: 9 },
  { id: 'generic', label: 'Genérico azul', color: '#1768c5', pale: '#e9f6ff', index: 10 },
  { id: 'generic-neutral', label: 'Genérico neutro', color: '#526781', pale: '#f0f4f8', index: 11 },
] as const;
export const getInstitutionTheme = (id?: string) =>
  institutionThemes.find((theme) => theme.id === id) || institutionThemes[10];
