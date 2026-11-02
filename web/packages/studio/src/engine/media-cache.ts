export interface CachedMedia {
  key: number;
  bytes: number;
  usedAt: number;
}

export const evictionsOf = (
  entries: readonly CachedMedia[],
  budgetBytes: number,
  keptKey: number,
): number[] => {
  let total = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  const evicted: number[] = [];
  const oldestFirst = entries
    .filter((entry) => entry.key !== keptKey && entry.bytes > 0)
    .sort((left, right) => left.usedAt - right.usedAt);

  for (const entry of oldestFirst) {
    if (total <= budgetBytes) {
      break;
    }
    evicted.push(entry.key);
    total -= entry.bytes;
  }

  return evicted;
};
