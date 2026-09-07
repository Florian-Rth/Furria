export const DEFAULT_RETURN_TO = '/';

const LAST_CONTROL_CODE_POINT = 0x1f;
const DELETE_CODE_POINT = 0x7f;

const hasControlCharacter = (value: string): boolean => {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint === undefined ||
      codePoint <= LAST_CONTROL_CODE_POINT ||
      codePoint === DELETE_CODE_POINT
    ) {
      return true;
    }
  }
  return false;
};

export const sanitizeReturnTo = (raw: string | undefined): string => {
  if (raw === undefined) {
    return DEFAULT_RETURN_TO;
  }

  const candidate = raw.trim();

  if (!candidate.startsWith('/')) {
    return DEFAULT_RETURN_TO;
  }
  if (candidate.startsWith('//')) {
    return DEFAULT_RETURN_TO;
  }
  if (candidate.includes('\\')) {
    return DEFAULT_RETURN_TO;
  }
  if (hasControlCharacter(candidate)) {
    return DEFAULT_RETURN_TO;
  }

  return candidate;
};
