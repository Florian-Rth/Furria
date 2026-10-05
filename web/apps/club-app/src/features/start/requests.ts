import { apiFetch } from '@/lib/api/api-fetch';
import type { Start } from './schemas';
import { StartSchema } from './schemas';

export const requestStart = (accessToken: string): Promise<Start> =>
  apiFetch('/api/start', { schema: StartSchema, accessToken });
