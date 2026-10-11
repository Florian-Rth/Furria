import { definePublicRead } from '@/lib/public-resource/define-public-resource';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { GroupMatcherSchema, SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';

export const groupMatcher = definePublicRead({
  key: 'group-matcher',
  read: (): Promise<GroupMatcher> =>
    Promise.resolve(GroupMatcherSchema.parse(SEEDED_GROUP_MATCHER)),
});
