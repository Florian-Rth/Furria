import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AdmissionAgeBand, GroupMatcherPage, StanceInput } from './schemas';
import { GroupMatcherPageSchema } from './schemas';

const groupMatcherPath = (groupId: number): string => `/api/groups/${groupId}/group-matcher`;

export const requestGroupMatcherPage = (
  groupId: number,
  accessToken: string,
): Promise<GroupMatcherPage> =>
  apiFetch(groupMatcherPath(groupId), { schema: GroupMatcherPageSchema, accessToken });

export const requestTakeStance = (
  groupId: number,
  stance: StanceInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${groupMatcherPath(groupId)}/stances/${stance.statementId}`, {
    method: 'PUT',
    body: { position: stance.position, importance: stance.importance },
    schema: NoContentSchema,
    accessToken,
  });

export const requestSetAdmissionAges = (
  groupId: number,
  admissionAges: readonly AdmissionAgeBand[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`${groupMatcherPath(groupId)}/admission-ages`, {
    method: 'PUT',
    body: { admissionAges: [...admissionAges] },
    schema: NoContentSchema,
    accessToken,
  });
