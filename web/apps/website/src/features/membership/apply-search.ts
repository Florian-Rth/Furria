import { z } from 'zod';

export const ApplySearchSchema = z.object({
  groups: z.string().optional().catch(undefined),
});

const GROUP_INTERESTS_SEPARATOR = ',';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;

export const parseGroupInterestsParam = (raw: string | undefined): number[] => {
  if (raw === undefined) {
    return [];
  }

  const requested = raw
    .split(GROUP_INTERESTS_SEPARATOR)
    .map((id) => id.trim())
    .filter((id) => GROUP_ID_PATTERN.test(id))
    .map(Number);

  return [...new Set(requested)];
};
