import { z } from 'zod';

export const SessionEndMessageSchema = z.object({ expired: z.boolean() }).catch({ expired: false });
export type SessionEndMessage = z.infer<typeof SessionEndMessageSchema>;
