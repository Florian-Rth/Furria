import { definePublicResource } from '@/lib/public-resource/define-public-resource';
import type { PublicClub } from './schemas';
import { PublicClubSchema } from './schemas';

export const publicClub = definePublicResource({
  path: '/api/public/club',
  schema: PublicClubSchema,
  key: 'public-club',
  select: (club): PublicClub => club,
});
