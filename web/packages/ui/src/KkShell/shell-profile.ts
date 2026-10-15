import type { KkImageSource } from '../image-source';
import type { KkHonours } from '../internal/honours/honour-types';

export interface KkShellProfile {
  label: string;
  to: string;
  initials: string;
  image?: KkImageSource | null;
  honours?: KkHonours;
}
