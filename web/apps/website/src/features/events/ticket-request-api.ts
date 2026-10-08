import type { QueryClient, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AltchaProof } from '@/lib/altcha/altcha-proof';
import type { AltchaProofSource } from '@/lib/altcha/proof-source';
import { submitWithFreshProof, usePreparedAltchaProof } from '@/lib/altcha/proof-source';
import { apiFetch } from '@/lib/api/api-fetch';
import type { TicketRequestForm, TicketRequestResponse } from './schemas';
import { TicketRequestResponseSchema } from './schemas';
import { buildTicketRequestPayload } from './ticket-request-payload';

const altchaProofSource: AltchaProofSource = {
  challengePath: '/api/ticket-requests/challenge',
  queryKey: ['ticket-request', 'altcha-proof'],
};

export const usePreparedTicketRequestAltchaProof = (isNeeded: boolean): void => {
  usePreparedAltchaProof(altchaProofSource, isNeeded);
};

export interface TicketRequestSubmission {
  eventId: number;
  values: TicketRequestForm;
}

const postTicketRequest = (
  submission: TicketRequestSubmission,
  proof: AltchaProof,
): Promise<TicketRequestResponse> =>
  apiFetch('/api/ticket-requests', {
    method: 'POST',
    body: buildTicketRequestPayload(submission.eventId, submission.values, proof.payload),
    schema: TicketRequestResponseSchema,
  });

const submitTicketRequest = (
  queryClient: QueryClient,
  submission: TicketRequestSubmission,
): Promise<TicketRequestResponse> =>
  submitWithFreshProof(queryClient, altchaProofSource, (proof) =>
    postTicketRequest(submission, proof),
  );

export const useSubmitTicketRequestMutation = (): UseMutationResult<
  TicketRequestResponse,
  Error,
  TicketRequestSubmission
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submission: TicketRequestSubmission): Promise<TicketRequestResponse> =>
      submitTicketRequest(queryClient, submission),
  });
};
