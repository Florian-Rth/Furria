import { z } from 'zod';

const QuietMemorySchema = z.object({
  v: z.literal(1),
  items: z.record(z.string(), z.iso.date()),
});
export type QuietMemory = z.infer<typeof QuietMemorySchema>;

export const EMPTY_QUIET_MEMORY: QuietMemory = { v: 1, items: {} };

export const quietMemoryKeyOf = (personId: number): string => `furria.start.${personId}.quiet`;

export const pruneQuiet = (memory: QuietMemory, today: string): QuietMemory => ({
  v: 1,
  items: Object.fromEntries(Object.entries(memory.items).filter(([, until]) => until >= today)),
});

export const parseQuietMemory = (raw: string | null, today: string): QuietMemory => {
  if (raw === null) {
    return EMPTY_QUIET_MEMORY;
  }

  try {
    const parsed = QuietMemorySchema.safeParse(JSON.parse(raw));

    return parsed.success ? pruneQuiet(parsed.data, today) : EMPTY_QUIET_MEMORY;
  } catch {
    return EMPTY_QUIET_MEMORY;
  }
};

export const isQuiet = (memory: QuietMemory, key: string, today: string): boolean => {
  const until = memory.items[key];

  return until !== undefined && until >= today;
};

export const quietAfterOpen = (memory: QuietMemory, key: string, until: string): QuietMemory => {
  const held = memory.items[key];

  return {
    v: 1,
    items: { ...memory.items, [key]: held !== undefined && held > until ? held : until },
  };
};
