import type { z } from 'zod';
import type { UnlockFormSchema, UnlockPreviewResponseSchema } from './schemas';

export type UnlockPreviewResponse = z.infer<typeof UnlockPreviewResponseSchema>;
export type UnlockForm = z.infer<typeof UnlockFormSchema>;

export interface PreviewAccessValue {
  granted: boolean;
  grantAccess: () => void;
}
