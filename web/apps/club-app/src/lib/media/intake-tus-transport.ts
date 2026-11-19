import type { UploadTransport } from './media-upload';
import { tokenTusTransport } from './token-tus-transport';

const INTAKE_UPLOADS = { path: '/api/media/intake-uploads', header: 'Intake-Token' };

export const intakeTusTransport = (token: string): UploadTransport =>
  tokenTusTransport(INTAKE_UPLOADS, token);
