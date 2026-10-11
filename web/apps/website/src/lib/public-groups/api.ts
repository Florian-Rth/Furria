import { definePublicResource } from '@/lib/public-resource/define-public-resource';
import type { PublicGroup } from './schemas';
import { PublicGroupsResponseSchema } from './schemas';

export const publicGroups = definePublicResource({
  path: '/api/public/groups',
  schema: PublicGroupsResponseSchema,
  key: 'public-groups',
  select: (response): PublicGroup[] => response.groups,
});
