import type { PersonAccess } from './schemas';

export interface AccessSubject {
  personId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  access: PersonAccess;
}
