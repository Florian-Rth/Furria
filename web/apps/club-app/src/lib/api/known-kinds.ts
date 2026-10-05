import { z } from 'zod';

const KindedEntrySchema = z.looseObject({ kind: z.string() });
type KindedEntry = z.output<typeof KindedEntrySchema>;

export const knownKindsOnly = <TEntry extends z.ZodType<object, KindedEntry>>(
  entry: TEntry,
  kinds: readonly string[],
): z.ZodType<z.output<TEntry>[]> =>
  z
    .array(KindedEntrySchema)
    .transform((entries) => entries.filter((candidate) => kinds.includes(candidate.kind)))
    .pipe(z.array(entry));
