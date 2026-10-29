import type { ReactNode, FormEvent } from 'react';
import type { Notice, Database, User, Membership, Category, Invite } from '../../domain/models';
export interface DialogProps {
  modal: string | null;
  manager: boolean;
  currentNotice: Notice | undefined;
  selected: string | null;
  data: Database;
  inst: string;
  user: User;
  members: Membership[];
  categories: Category[];
  invites: Invite[];
  errorBox: ReactNode;
  busy: boolean;
  run: (action: () => void | Promise<void>) => Promise<void>;
  manage: () => void;
  commit: (db: Database) => void;
  close: () => void;
  notify: (message: string) => void;
  openModal: (kind: string, id?: string) => void;
  saveNotice: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  setPage: (page: string) => void;
  setUserId: (id: string | null) => void;
  setInstitutionId: (id: string) => void;
}
