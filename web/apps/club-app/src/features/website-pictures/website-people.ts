import type { PersonRef } from '@/lib/api/schemas';

export const editorNameOf = (person: PersonRef | null): string | null =>
  person === null ? null : `${person.firstName} ${person.lastName}`;
