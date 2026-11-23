import type { ElementType, FC } from 'react';
import type { KkImageSource } from '../../image-source';
import type { KkGroupTone } from '../../internal/group-tone';
import type { KkSx } from '../../kk-sx';
import type { KkAvatarOpen } from './avatar-open';
import type { KkAvatarSize } from './avatar-tier';
import { avatarMetrics } from './avatar-tier';
import { KkAvatarKit } from './KkAvatarKit';

const CENTER = 50;
const WHOLE = 1;

interface KkOpenableAvatarProps {
  initials: string;
  image: KkImageSource;
  size: KkAvatarSize;
  tone?: KkGroupTone;
  open: KkAvatarOpen;
  component?: ElementType;
  sx?: KkSx;
}

export const KkOpenableAvatar: FC<KkOpenableAvatarProps> = ({
  initials,
  image,
  size,
  tone,
  open,
  component,
  sx,
}) => {
  const metrics = avatarMetrics[size];

  return (
    <KkAvatarKit size={metrics.size} component={component} sx={sx}>
      <KkAvatarKit.Face
        initials={initials}
        image={image}
        extent={metrics.size}
        imageSizes={metrics.size}
        typography={metrics.typography}
        tone={tone}
        component="span"
      />
      <KkAvatarKit.Spot x={CENTER} y={CENTER} share={WHOLE}>
        <KkAvatarKit.OpenButton label={open.label} onOpen={open.onOpen} />
      </KkAvatarKit.Spot>
    </KkAvatarKit>
  );
};
