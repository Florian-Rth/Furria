import { createMediaSchemas } from '@furria/api-client';
import { apiUrlOf } from './api-fetch';

export const { PictureSchema, PublicWebsitePicturesSchema } = createMediaSchemas(apiUrlOf);
