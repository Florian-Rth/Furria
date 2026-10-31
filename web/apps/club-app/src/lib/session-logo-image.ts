import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import type { SessionLogo } from '@/lib/api/schemas';

export const toSessionLogoImage = (
  logo: SessionLogo | null,
  sizes?: string,
): KkImageSource | null => (logo === null ? null : toImageSource(logo.picture, logo.aspect, sizes));
