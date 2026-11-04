export const HALL_ELEMENT_ID_PREFIX = 'e';
export const ROW_ID_PREFIX = 'r';
export const GROUP_ID_PREFIX = 'g';

const counterOf = (id: string, prefix: string): number | null => {
  if (!id.startsWith(prefix)) {
    return null;
  }
  const rest = id.slice(prefix.length);

  return /^\d+$/.test(rest) ? Number(rest) : null;
};

export const highestCounter = (prefix: string, existing: Iterable<string>): number => {
  let highest = 0;
  for (const id of existing) {
    const counter = counterOf(id, prefix);
    if (counter !== null && counter > highest) {
      highest = counter;
    }
  }

  return highest;
};

export const nextIds = (prefix: string, existing: Iterable<string>, count: number): string[] => {
  const start = highestCounter(prefix, existing) + 1;

  return Array.from({ length: Math.max(0, count) }, (_, index) => `${prefix}${start + index}`);
};

export const nextId = (prefix: string, existing: Iterable<string>): string =>
  `${prefix}${highestCounter(prefix, existing) + 1}`;
