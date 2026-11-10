import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { ClaimWindowOverview, ClaimWindowStatus, WindowClaimResult } from './schemas';
import {
  ClaimWindowOverviewSchema,
  ClaimWindowStatusSchema,
  WindowClaimResultSchema,
} from './schemas';

const PUBLIC_PATH = '/api/auth/claim-window';
const SYSTEM_PATH = '/api/system/claim-window';

export interface WindowClaim {
  firstName: string;
  lastName: string;
  birthDate: string;
}

export const requestClaimWindowStatus = (): Promise<ClaimWindowStatus> =>
  apiFetch(PUBLIC_PATH, { schema: ClaimWindowStatusSchema });

export const requestWindowClaim = (claim: WindowClaim): Promise<WindowClaimResult> =>
  apiFetch(`${PUBLIC_PATH}/claims`, {
    method: 'POST',
    body: { firstName: claim.firstName, lastName: claim.lastName, birthDate: claim.birthDate },
    schema: WindowClaimResultSchema,
  });

export const requestClaimWindowOverview = (accessToken: string): Promise<ClaimWindowOverview> =>
  apiFetch(SYSTEM_PATH, { schema: ClaimWindowOverviewSchema, accessToken });

export const requestClaimWindowOpen = (closesAt: string, accessToken: string): Promise<void> =>
  apiFetch(SYSTEM_PATH, {
    method: 'PUT',
    body: { closesAt },
    schema: NoContentSchema,
    accessToken,
  });

export const requestClaimWindowClose = (accessToken: string): Promise<void> =>
  apiFetch(SYSTEM_PATH, { method: 'DELETE', schema: NoContentSchema, accessToken });
