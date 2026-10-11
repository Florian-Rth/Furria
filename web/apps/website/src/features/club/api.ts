import { definePublicResource } from '@/lib/public-resource/define-public-resource';
import type { PublicBoardSeat } from './schemas';
import { PublicBoardResponseSchema } from './schemas';

export const publicBoard = definePublicResource({
  path: '/api/public/board',
  schema: PublicBoardResponseSchema,
  key: 'public-board',
  select: (response): PublicBoardSeat[] => response.seats,
});
