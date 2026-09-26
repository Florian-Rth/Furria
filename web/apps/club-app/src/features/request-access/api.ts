import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { NoContent } from '@/lib/api/schemas';
import { requestAccess } from './requests';

export const useRequestAccessMutation = (): UseMutationResult<NoContent, Error, string> =>
  useMutation({ mutationFn: requestAccess });
