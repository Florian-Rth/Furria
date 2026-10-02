import { z } from 'zod';
import type { GreetingAct } from './greeting-act';

const GreetingMemorySchema = z.object({
  v: z.literal(1),
  key: z.string(),
  cells: z.array(z.string()),
  burstYear: z.int().optional(),
});
export type GreetingMemory = z.infer<typeof GreetingMemorySchema>;

export const greetingMemoryKeyOf = (personId: number): string =>
  `furria.start.${personId}.greeting`;

export const parseGreetingMemory = (raw: string | null): GreetingMemory | null => {
  if (raw === null) {
    return null;
  }

  try {
    const parsed = GreetingMemorySchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const nextGreetingMemory = (
  previous: GreetingMemory | null,
  act: Pick<GreetingAct, 'key' | 'sessionYear'>,
  cells: readonly string[],
  burstFired: boolean,
): GreetingMemory => {
  const burstYear = burstFired ? act.sessionYear : previous?.burstYear;
  const memory: GreetingMemory = { v: 1, key: act.key, cells: [...cells] };

  return burstYear === undefined ? memory : { ...memory, burstYear };
};
