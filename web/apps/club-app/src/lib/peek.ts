export type PeekKind = 'member' | 'group';

const SEPARATOR = '-';
const ID_PATTERN = /^[1-9]\d*$/;

export const toPeekId = (kind: PeekKind, id: number): string => `${kind}${SEPARATOR}${id}`;

export const toPeekedId = (sheetId: string | null, kind: PeekKind): number | null => {
  if (sheetId === null) {
    return null;
  }

  const prefix = `${kind}${SEPARATOR}`;

  if (!sheetId.startsWith(prefix)) {
    return null;
  }

  const raw = sheetId.slice(prefix.length);

  return ID_PATTERN.test(raw) ? Number(raw) : null;
};
