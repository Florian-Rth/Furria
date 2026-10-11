import type { MediaUpload, UploadHandle } from './media-upload';
import { uploadVia } from './media-upload';
import { tusTransport } from './tus-transport';

export const startUpload = (upload: MediaUpload): UploadHandle => uploadVia(tusTransport, upload);
