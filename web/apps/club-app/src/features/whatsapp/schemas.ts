import { z } from 'zod';

export const WhatsAppStateSchema = z.enum([
  'off',
  'unreachable',
  'stopped',
  'starting',
  'scanQrCode',
  'working',
  'failed',
]);
export type WhatsAppState = z.infer<typeof WhatsAppStateSchema>;

export const WhatsAppGroupSchema = z.object({
  chatId: z.string(),
  name: z.string(),
});
export type WhatsAppGroup = z.infer<typeof WhatsAppGroupSchema>;

export const WhatsAppOverviewSchema = z.object({
  state: WhatsAppStateSchema,
  botPhone: z.string().nullable(),
  clubChatId: z.string().nullable(),
  groups: z.array(WhatsAppGroupSchema),
});
export type WhatsAppOverview = z.infer<typeof WhatsAppOverviewSchema>;

export const WhatsAppReachSchema = z.object({ clubGroup: z.boolean() });
export type WhatsAppReach = z.infer<typeof WhatsAppReachSchema>;

export const WhatsAppQrCodeSchema = z.object({ value: z.string() });
export type WhatsAppQrCode = z.infer<typeof WhatsAppQrCodeSchema>;

export const WhatsAppPairingCodeSchema = z.object({ code: z.string() });
export type WhatsAppPairingCode = z.infer<typeof WhatsAppPairingCodeSchema>;
