import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { WhatsAppOverview, WhatsAppPairingCode, WhatsAppQrCode } from './schemas';
import { WhatsAppOverviewSchema, WhatsAppPairingCodeSchema, WhatsAppQrCodeSchema } from './schemas';

const API_PATH = '/api/system/whatsapp';

export const requestWhatsAppOverview = (accessToken: string): Promise<WhatsAppOverview> =>
  apiFetch(API_PATH, { schema: WhatsAppOverviewSchema, accessToken });

export const requestWhatsAppQrCode = (accessToken: string): Promise<WhatsAppQrCode> =>
  apiFetch(`${API_PATH}/qr-code`, { schema: WhatsAppQrCodeSchema, accessToken });

export const requestWhatsAppLinking = (accessToken: string): Promise<void> =>
  apiFetch(`${API_PATH}/session`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestWhatsAppPairingCode = (
  phoneNumber: string,
  accessToken: string,
): Promise<WhatsAppPairingCode> =>
  apiFetch(`${API_PATH}/pairing-code`, {
    method: 'POST',
    body: { phoneNumber },
    schema: WhatsAppPairingCodeSchema,
    accessToken,
  });

export const requestWhatsAppClubGroup = (chatId: string, accessToken: string): Promise<void> =>
  apiFetch(`${API_PATH}/club-group`, {
    method: 'PUT',
    body: { chatId },
    schema: NoContentSchema,
    accessToken,
  });
