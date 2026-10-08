import { z } from 'zod';

export const AltchaChallengeSchema = z.object({
  parameters: z.object({
    algorithm: z.string(),
    cost: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
    keyLength: z.number().int().positive(),
    keyPrefix: z.string(),
    keySignature: z.string(),
    nonce: z.string(),
    salt: z.string(),
  }),
  signature: z.string(),
});

export type AltchaChallenge = z.infer<typeof AltchaChallengeSchema>;
