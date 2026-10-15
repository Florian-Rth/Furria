import { apiFetch } from '@/lib/api/api-fetch';
import type { ManageHub } from './schemas';
import { ManageHubSchema } from './schemas';

export const requestManageHub = (accessToken: string): Promise<ManageHub> =>
  apiFetch('/api/manage/hub', { schema: ManageHubSchema, accessToken });
