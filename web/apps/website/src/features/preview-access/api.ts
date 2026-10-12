import { ApiError } from '@furria/api-client';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { UnlockPreviewResponse } from './schemas';
import { UnlockPreviewResponseSchema } from './schemas';
import { WrongPasswordError } from './unlock-failure';

const unlockPreview = async (password: string): Promise<UnlockPreviewResponse> => {
  try {
    return await apiFetch('/api/preview/unlock', {
      method: 'POST',
      body: { password },
      schema: UnlockPreviewResponseSchema,
    });
  } catch (error) {
    if (error instanceof ApiError && error.failure.kind === 'unauthorized') {
      throw new WrongPasswordError();
    }
    throw error;
  }
};

export const useUnlockPreviewMutation = (): UseMutationResult<
  UnlockPreviewResponse,
  Error,
  string
> => useMutation({ mutationFn: unlockPreview });
