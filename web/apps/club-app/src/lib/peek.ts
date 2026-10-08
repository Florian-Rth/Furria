import { parsePositiveId } from './positive-id';

export type PeekKind =
  | 'member'
  | 'group'
  | 'venue'
  | 'entry'
  | 'role'
  | 'office'
  | 'start-announcements';

const SEPARATOR = '-';

export const toPeekId = (kind: PeekKind, id: number): string => `${kind}${SEPARATOR}${id}`;

export const toPeekedId = (sheetId: string | null, kind: PeekKind): number | null => {
  if (sheetId === null) {
    return null;
  }

  const prefix = `${kind}${SEPARATOR}`;

  if (!sheetId.startsWith(prefix)) {
    return null;
  }

  return parsePositiveId(sheetId.slice(prefix.length));
};
