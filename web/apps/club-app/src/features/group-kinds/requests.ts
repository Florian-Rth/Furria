import { apiFetch } from '@/lib/api/api-fetch';
import type { GroupKindsResponse } from './schemas';
import { GroupKindsResponseSchema } from './schemas';

export const requestGroupKinds = (accessToken: string): Promise<GroupKindsResponse> =>
  apiFetch('/api/group-kinds', { schema: GroupKindsResponseSchema, accessToken });
