import { z } from 'zod';

export const PushKeySchema = z.object({ publicKey: z.string().min(1) });
export type PushKey = z.infer<typeof PushKeySchema>;

export const PushDeviceSchema = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});
export type PushDevice = z.infer<typeof PushDeviceSchema>;

export const PushDeliverySchema = z.object({
  delivered: z.number().int().nonnegative(),
  forgotten: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});
export type PushDelivery = z.infer<typeof PushDeliverySchema>;

export const TestPushResultSchema = z.object({ delivery: PushDeliverySchema });
export type TestPushResult = z.infer<typeof TestPushResultSchema>;

export const PUSH_OPEN_MESSAGE = 'furria:push-open';

export const AppPathSchema = z
  .string()
  .regex(/^\/(?![/\\])\P{Cc}*$/u)
  .catch('/');

export const PushOpenMessageSchema = z.object({
  type: z.literal(PUSH_OPEN_MESSAGE),
  path: AppPathSchema,
});

export const PushTopicSchema = z.enum([
  'invitations',
  'changes',
  'reminders',
  'announcements',
  'beerTab',
  'beerStock',
]);
export type PushTopic = z.infer<typeof PushTopicSchema>;

export const PushTopicSettingSchema = z.object({
  topic: PushTopicSchema,
  isEnabled: z.boolean(),
});
export type PushTopicSetting = z.infer<typeof PushTopicSettingSchema>;

export const PushTopicsSchema = z.object({ topics: z.array(PushTopicSettingSchema) });
export type PushTopics = z.infer<typeof PushTopicsSchema>;
