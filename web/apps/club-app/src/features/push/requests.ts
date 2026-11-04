import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { PushDevice, PushKey, TestPushResult } from './schemas';
import { PushKeySchema, TestPushResultSchema } from './schemas';

export const requestPushKey = (accessToken: string): Promise<PushKey> =>
  apiFetch('/api/push/key', { schema: PushKeySchema, accessToken });

export const requestPushSubscription = (device: PushDevice, accessToken: string): Promise<void> =>
  apiFetch('/api/push/subscription', {
    method: 'PUT',
    body: device,
    schema: NoContentSchema,
    accessToken,
  });

export const requestPushRemoval = (endpoint: string, accessToken: string): Promise<void> =>
  apiFetch('/api/push/subscription/remove', {
    method: 'POST',
    body: { endpoint },
    schema: NoContentSchema,
    accessToken,
  });

export const requestTestPush = (_input: undefined, accessToken: string): Promise<TestPushResult> =>
  apiFetch('/api/system/test-push', {
    method: 'POST',
    schema: TestPushResultSchema,
    accessToken,
  });
