import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import { ApiError } from '@/lib/api/errors';
import type { UnlockPreviewResponse } from './schemas';
import { UnlockPreviewResponseSchema } from './schemas';

export class WrongPasswordError extends Error {
  constructor() {
    super('The preview password was rejected by the API.');
    this.name = 'WrongPasswordError';
  }
}

const unlockPreview = async (password: string): Promise<UnlockPreviewResponse> => {
  try {
    return await apiFetch('/api/preview/unlock', {
      method: 'POST',
      body: { password },
      schema: UnlockPreviewResponseSchema,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
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
