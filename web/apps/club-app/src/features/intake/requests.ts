import type { JsonBody } from '@furria/api-client';
import { apiFetch } from '@/lib/api/api-fetch';
import type { IntakeLinkLookup, IntakeSubmitted } from './schemas';
import { IntakeLinkLookupSchema, IntakeSubmittedSchema } from './schemas';

export const requestIntakeLinkLookup = (token: string): Promise<IntakeLinkLookup> =>
  apiFetch('/api/public/intakes/lookup', {
    method: 'POST',
    body: { token },
    schema: IntakeLinkLookupSchema,
  });

export const requestIntakeSubmission = (body: JsonBody): Promise<IntakeSubmitted> =>
  apiFetch('/api/public/intakes/submit', {
    method: 'POST',
    body,
    schema: IntakeSubmittedSchema,
  });
