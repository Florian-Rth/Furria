export const HEADING_MARKER = '## ';
export const ITEM_MARKER = '- ';
export const BOLD_MARKER = '**';

const ESCAPABLE = /^[!-/:-@[-`{-~]$/;
const TAG_OPENER = /^[A-Za-z/!?]$/;
const MENTION_TARGET = /^(group|person):([0-9]+)$/;
const WHITESPACE = /\s/;

export const LINE_BREAK = /\r\n|[\n\r\f\v\u0085\u2028\u2029]/;

export const isEscapeAt = (source: string, index: number): boolean =>
  source[index] === '\\' && ESCAPABLE.test(source[index + 1] ?? '');

export const opensTagAt = (source: string, index: number): boolean =>
  source[index] === '<' && TAG_OPENER.test(source[index + 1] ?? '');

export const isWebAddress = (target: string): boolean => {
  if (target.length === 0 || WHITESPACE.test(target) || !URL.canParse(target)) {
    return false;
  }
  const address = new URL(target);
  return (address.protocol === 'https:' || address.protocol === 'http:') && address.hostname !== '';
};

export const isMentionId = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

export const mentionTargetOf = (
  target: string,
): { kind: 'group' | 'person'; id: number } | null => {
  const match = MENTION_TARGET.exec(target);
  if (match === null) {
    return null;
  }
  const id = Number(match[2]);
  return isMentionId(id) ? { kind: match[1] === 'person' ? 'person' : 'group', id } : null;
};
