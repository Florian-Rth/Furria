import { apiFetch } from '@/lib/api/api-fetch';
import type { RolesOverviewResponse } from './schemas';
import { RolesOverviewResponseSchema } from './schemas';

export const requestRolesOverview = (accessToken: string): Promise<RolesOverviewResponse> =>
  apiFetch('/api/roles', { schema: RolesOverviewResponseSchema, accessToken });
