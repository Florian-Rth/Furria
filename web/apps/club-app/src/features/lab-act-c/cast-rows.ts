import type { PortraitPersonRef } from '@/lib/api/schemas';

export type CastRole = 'self' | 'editor' | 'member';

export interface CastRow {
  person: PortraitPersonRef;
  role: CastRole;
}

const COLLATOR = new Intl.Collator('de-DE');

const roleOf = (
  person: PortraitPersonRef,
  editorIds: ReadonlySet<number>,
  viewerId: number | null,
): CastRole => {
  if (person.personId === viewerId) {
    return 'self';
  }

  return editorIds.has(person.personId) ? 'editor' : 'member';
};

export const castRowsOf = (
  cast: readonly PortraitPersonRef[],
  editors: readonly PortraitPersonRef[],
  viewerId: number | null,
): CastRow[] => {
  const editorIds = new Set(editors.map((editor) => editor.personId));

  return [...cast]
    .sort(
      (left, right) =>
        COLLATOR.compare(left.firstName, right.firstName) ||
        COLLATOR.compare(left.lastName, right.lastName),
    )
    .map((person) => ({ person, role: roleOf(person, editorIds, viewerId) }));
};
