import type { KkRingedAvatarSize } from '../../internal/honours/honour-metrics';
import type { KkHonours, KkStanding } from '../../internal/honours/honour-types';

export type KkAvatarSize = 'small' | KkRingedAvatarSize;

export type KkAvatarTypography = 'caption' | 'h4' | 'h2' | 'h1' | 'display';

export interface KkAvatarMetrics {
  size: string;
  typography: KkAvatarTypography;
}

export const avatarMetrics: Record<KkAvatarSize, KkAvatarMetrics> = {
  small: { size: '1.625rem', typography: 'caption' },
  bar: { size: '2rem', typography: 'caption' },
  medium: { size: '2.5rem', typography: 'h4' },
  large: { size: '3.5rem', typography: 'h2' },
  header: { size: '4.5rem', typography: 'h1' },
  portrait: { size: '6rem', typography: 'h1' },
};

export const ringedSizeOf = (
  size: KkAvatarSize,
  honours: KkHonours | undefined,
  standing: KkStanding | undefined,
): KkRingedAvatarSize | null => {
  if (size === 'small' || (honours === undefined && standing === undefined)) {
    return null;
  }

  return size;
};
