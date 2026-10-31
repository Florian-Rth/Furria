import { useKkNotice } from '@furria/ui/KkNotice';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiMutation } from './api-mutation-options';
import { toApiMutationOptions } from './api-mutation-options';
import { withFreshAccessToken } from './session/session-store';

export const useApiMutation = <TInput, TResult, TMemo = undefined>(
  definition: ApiMutation<TInput, TResult, TMemo>,
): UseMutationResult<TResult, Error, TInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation(
    toApiMutationOptions({ queryClient, raiseNotice, authorize: withFreshAccessToken }, definition),
  );
};
