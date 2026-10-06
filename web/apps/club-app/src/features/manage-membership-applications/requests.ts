import type { JsonBody } from '@/lib/api/api-fetch';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AdmissionRequest } from './admission';
import type {
  AdmissionResult,
  MembershipApplicationDetails,
  MembershipApplicationsResponse,
} from './schemas';
import {
  AdmissionResultSchema,
  MembershipApplicationDetailsSchema,
  MembershipApplicationsResponseSchema,
} from './schemas';

const APPLICATIONS_PATH = '/api/manage/membership-applications';

export const requestMembershipApplications = (
  accessToken: string,
): Promise<MembershipApplicationsResponse> =>
  apiFetch(APPLICATIONS_PATH, { schema: MembershipApplicationsResponseSchema, accessToken });

export const requestMembershipApplication = (
  membershipApplicationId: number,
  accessToken: string,
): Promise<MembershipApplicationDetails> =>
  apiFetch(`${APPLICATIONS_PATH}/${membershipApplicationId}`, {
    schema: MembershipApplicationDetailsSchema,
    accessToken,
  });

export const requestMembershipApplicationDecline = (
  membershipApplicationId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${APPLICATIONS_PATH}/${membershipApplicationId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

const toAdmissionBody = (request: AdmissionRequest): JsonBody => ({
  personId: request.personId,
  admittedOn: request.admittedOn,
  guardianConsentConfirmed: request.guardianConsentConfirmed,
});

export const requestMembershipApplicationAdmission = (
  membershipApplicationId: number,
  request: AdmissionRequest,
  accessToken: string,
): Promise<AdmissionResult> =>
  apiFetch(`${APPLICATIONS_PATH}/${membershipApplicationId}/admission`, {
    method: 'POST',
    body: toAdmissionBody(request),
    schema: AdmissionResultSchema,
    accessToken,
  });
