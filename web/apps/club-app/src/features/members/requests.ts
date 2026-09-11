import { apiFetch } from '@/lib/api/api-fetch';
import type { MemberDetails, MembersResponse } from './schemas';
import { MemberDetailsSchema, MembersResponseSchema } from './schemas';

export const requestMembers = (accessToken: string): Promise<MembersResponse> =>
  apiFetch('/api/members', { schema: MembersResponseSchema, accessToken });

export const requestMember = (personId: number, accessToken: string): Promise<MemberDetails> =>
  apiFetch(`/api/members/${personId}`, { schema: MemberDetailsSchema, accessToken });
