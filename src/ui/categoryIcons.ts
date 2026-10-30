import { BookOpen, Briefcase, GraduationCap, Heart, School, Star, Tags, Users } from 'lucide-react';
export const categoryIcons = {
  tags: { label: 'Etiqueta', icon: Tags },
  book: { label: 'Livro', icon: BookOpen },
  graduation: { label: 'Formatura', icon: GraduationCap },
  people: { label: 'Pessoas', icon: Users },
  school: { label: 'Escola', icon: School },
  briefcase: { label: 'Pasta', icon: Briefcase },
  heart: { label: 'Coração', icon: Heart },
  star: { label: 'Estrela', icon: Star },
} as const;
export type CategoryIconName = keyof typeof categoryIcons;
export function categoryIcon(name?: string) {
  return categoryIcons[name as CategoryIconName]?.icon || Tags;
}
export const defaultCategoryColor = '#628a65';
export function categoryColor(color?: string) {
  return color && /^#[0-9a-f]{6}$/i.test(color) ? color : defaultCategoryColor;
}
