import { z } from 'zod';

export const UnlockPreviewResponseSchema = z.object({
  granted: z.boolean(),
});

export const UnlockFormSchema = z.object({
  password: z.string().min(1, 'Bitte gib das Passwort ein.'),
});
