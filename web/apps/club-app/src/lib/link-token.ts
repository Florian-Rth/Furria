const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const tokenOfHash = (hash: string): string | null => {
  const token = hash.startsWith('#') ? hash.slice(1) : hash;
  return TOKEN_PATTERN.test(token) ? token : null;
};
