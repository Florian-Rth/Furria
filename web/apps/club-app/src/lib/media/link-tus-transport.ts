import type { UploadTransport } from './media-upload';
import { tokenTusTransport } from './token-tus-transport';

const LINK_UPLOADS = { path: '/api/media/link-uploads', header: 'Upload-Link-Token' };

export const linkTusTransport = (token: string): UploadTransport =>
  tokenTusTransport(LINK_UPLOADS, token);
