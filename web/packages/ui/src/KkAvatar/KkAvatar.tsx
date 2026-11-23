import type { ElementType, FC } from 'react';
import type { KkImageSource } from '../image-source';
import type { KkGroupTone } from '../internal/group-tone';
import type { KkHonours, KkStanding } from '../internal/honours/honour-types';
import type { KkSx } from '../kk-sx';
import type { KkAvatarOpen } from './internal/avatar-open';
import type { KkAvatarSize } from './internal/avatar-tier';
import { avatarMetrics, ringedSizeOf } from './internal/avatar-tier';
import { KkOpenableAvatar } from './internal/KkOpenableAvatar';
import { KkRingedAvatar } from './internal/KkRingedAvatar';
import { KkAvatarFace } from './internal/ui/KkAvatarFace';

export type { KkAvatarOpen, KkAvatarSize };

interface KkAvatarProps {
  initials: string;
  image?: KkImageSource | null;
  size?: KkAvatarSize;
  tone?: KkGroupTone;
  honours?: KkHonours;
  standing?: KkStanding;
  arrival?: boolean;
  open?: KkAvatarOpen;
  component?: ElementType;
  sx?: KkSx;
}

export const KkAvatar: FC<KkAvatarProps> = ({
  initials,
  image,
  size = 'medium',
  tone,
  honours,
  standing,
  arrival = false,
  open,
  component,
  sx,
}) => {
  const ringed = ringedSizeOf(size, honours, standing);
  const metrics = avatarMetrics[size];
  const portrait = image ?? null;
  const opening = portrait === null ? undefined : open;

  if (ringed === null && portrait !== null && open !== undefined) {
    return (
      <KkOpenableAvatar
        initials={initials}
        image={portrait}
        size={size}
        tone={tone}
        open={open}
        component={component}
        sx={sx}
      />
    );
  }

  if (ringed === null) {
    return (
      <KkAvatarFace
        initials={initials}
        image={image}
        extent={metrics.size}
        imageSizes={metrics.size}
        typography={metrics.typography}
        tone={tone}
        component={component}
        sx={sx}
      />
    );
  }

  return (
    <KkRingedAvatar
      initials={initials}
      image={image}
      size={ringed}
      tone={tone}
      honours={honours}
      standing={standing}
      arrival={arrival}
      open={opening}
      component={component}
      sx={sx}
    />
  );
};
