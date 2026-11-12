import { apiFetch } from '@/lib/api/api-fetch';
import { definePublicRead } from '@/lib/public-resource/define-public-resource';
import { isMissingRead } from '@/lib/public-resource/public-source';
import { toGroupMatcher } from './group-matcher-model';
import { PublicGroupMatcherResponseSchema } from './schemas';
import type { GroupMatcher } from './types';

const readGroupMatcher = async (): Promise<GroupMatcher | null> => {
  try {
    return toGroupMatcher(
      await apiFetch('/api/public/group-matcher', { schema: PublicGroupMatcherResponseSchema }),
    );
  } catch (error) {
    if (error instanceof Error && isMissingRead(error)) {
      return null;
    }

    throw error;
  }
};

export const groupMatcher = definePublicRead({
  key: 'group-matcher',
  read: readGroupMatcher,
});
