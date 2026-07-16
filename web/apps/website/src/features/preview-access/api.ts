import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { UnlockPreviewResponseSchema } from './schemas';
import type { UnlockPreviewResponse } from './types';

export class WrongPasswordError extends Error {
  constructor() {
    super('The preview password was rejected by the API.');
    this.name = 'WrongPasswordError';
  }
}

const unlockPreview = async (password: string): Promise<UnlockPreviewResponse> => {
  const response = await fetch('/api/preview/unlock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (response.status === 401) {
    throw new WrongPasswordError();
  }

  if (!response.ok) {
    throw new Error(`Unlocking the preview failed with status ${response.status}.`);
  }

  return UnlockPreviewResponseSchema.parse(await response.json());
};

export const useUnlockPreviewMutation = (): UseMutationResult<
  UnlockPreviewResponse,
  Error,
  string
> => useMutation({ mutationFn: unlockPreview });
