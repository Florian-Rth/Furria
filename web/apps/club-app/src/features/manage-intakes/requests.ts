import type { JsonBody } from '@furria/api-client';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { IntakeDecision } from './intake-decision';
import type {
  IntakeDetails,
  IntakesResponse,
  RenewedIntake,
  ResolvedIntake,
  StartedIntake,
} from './schemas';
import {
  IntakeDetailsSchema,
  IntakesResponseSchema,
  RenewedIntakeSchema,
  ResolvedIntakeSchema,
  StartedIntakeSchema,
} from './schemas';

const INTAKES_PATH = '/api/intakes';

const intakePathOf = (intakeId: number): string => `${INTAKES_PATH}/${intakeId}`;

const toDecisionBody = (decision: IntakeDecision): JsonBody => ({
  memberFrom: decision.memberFrom,
  groupIds: [...decision.groupIds],
  label: decision.label,
});

export const requestIntakes = (accessToken: string): Promise<IntakesResponse> =>
  apiFetch(INTAKES_PATH, { schema: IntakesResponseSchema, accessToken });

export const requestIntake = (intakeId: number, accessToken: string): Promise<IntakeDetails> =>
  apiFetch(intakePathOf(intakeId), { schema: IntakeDetailsSchema, accessToken });

export const requestIntakeStart = (
  decision: IntakeDecision,
  accessToken: string,
): Promise<StartedIntake> =>
  apiFetch(INTAKES_PATH, {
    method: 'POST',
    body: toDecisionBody(decision),
    schema: StartedIntakeSchema,
    accessToken,
  });

export const requestIntakeEdit = (
  intakeId: number,
  decision: IntakeDecision,
  accessToken: string,
): Promise<void> =>
  apiFetch(intakePathOf(intakeId), {
    method: 'PUT',
    body: toDecisionBody(decision),
    schema: NoContentSchema,
    accessToken,
  });

export const requestIntakeRenewal = (
  intakeId: number,
  accessToken: string,
): Promise<RenewedIntake> =>
  apiFetch(`${intakePathOf(intakeId)}/renew`, {
    method: 'POST',
    schema: RenewedIntakeSchema,
    accessToken,
  });

export const requestIntakeDiscard = (intakeId: number, accessToken: string): Promise<void> =>
  apiFetch(`${intakePathOf(intakeId)}/discard`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestIntakeResolution = (
  intakeId: number,
  personId: number | null,
  accessToken: string,
): Promise<ResolvedIntake> =>
  apiFetch(`${intakePathOf(intakeId)}/resolve`, {
    method: 'POST',
    body: { personId },
    schema: ResolvedIntakeSchema,
    accessToken,
  });
