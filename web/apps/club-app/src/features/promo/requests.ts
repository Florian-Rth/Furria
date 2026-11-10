import { apiFetch } from '@/lib/api/api-fetch';
import type { PromoMembersResponse } from './schemas';
import { PromoMembersResponseSchema } from './schemas';

export const requestPromoMembers = (accessToken: string): Promise<PromoMembersResponse> =>
  apiFetch('/api/promo/members', { schema: PromoMembersResponseSchema, accessToken });
