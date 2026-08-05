import { z } from 'zod';

export const ApplySearchSchema = z.object({
  groups: z.string().optional().catch(undefined),
});

const GROUP_INTERESTS_SEPARATOR = ',';

export const parseGroupInterestsParam = (raw: string | undefined): string[] => {
  if (raw === undefined) {
    return [];
  }

  const requested = raw
    .split(GROUP_INTERESTS_SEPARATOR)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  return [...new Set(requested)];
};
