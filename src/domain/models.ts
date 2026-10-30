export type Role = 'manager' | 'member';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export interface User {
  id: string;
  name: string;
  email: string;
  hash: string;
  salt: string;
  isAdministrator?: boolean;
  isManager?: boolean;
}
export interface ManagerActivity {
  id: string;
  userId: string;
  at: string;
  description: string;
}
export interface Institution {
  id: string;
  name: string;
  acronym: string;
  color: string;
  phone?: string;
  email?: string;
  address?: string;
}
export interface Membership {
  id: string;
  userId: string;
  institutionId: string;
  role: Role;
  active: boolean;
  categoryIds: string[];
  validUntil?: string;
}
export interface Category {
  id: string;
  institutionId: string;
  name: string;
  archived: boolean;
  icon?: string;
  color?: string;
}
export interface Invite {
  id: string;
  institutionId: string;
  email: string;
  role: Role;
  expiresAt: string;
  used: boolean;
  revoked: boolean;
  categoryIds?: string[];
  validUntil?: string;
}
export interface Receipt {
  userId: string;
  openedAt?: string;
  confirmedAt?: string;
}
export interface Notice {
  id: string;
  institutionId: string;
  authorId: string;
  title: string;
  body: string;
  priority: Priority;
  requiresConfirmation: boolean;
  audience: 'all' | 'categories' | 'individuals';
  categoryIds: string[];
  recipientIds?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  publishedAt?: string;
  receipts: Receipt[];
}
export interface Database {
  version: 2;
  users: User[];
  institutions: Institution[];
  memberships: Membership[];
  categories: Category[];
  invites: Invite[];
  notices: Notice[];
  managerActivities?: ManagerActivity[];
}
export const priorities: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};
export const emptyDatabase = (): Database => ({
  version: 2,
  users: [],
  institutions: [],
  memberships: [],
  categories: [],
  invites: [],
  notices: [],
});
