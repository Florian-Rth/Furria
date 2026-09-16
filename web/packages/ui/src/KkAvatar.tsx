import Avatar from '@mui/material/Avatar';
import type { ElementType, FC } from 'react';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkAvatarSize = 'small' | 'medium' | 'large';

interface KkAvatarMetrics {
  size: number;
  fontSize: string;
}

const avatarMetrics: Record<KkAvatarSize, KkAvatarMetrics> = {
  small: { size: 26, fontSize: '0.6875rem' },
  medium: { size: 40, fontSize: '1.0625rem' },
  large: { size: 56, fontSize: '1.5rem' },
};

interface KkAvatarProps {
  initials: string;
  size?: KkAvatarSize;
  component?: ElementType;
  sx?: KkSx;
}

export const KkAvatar: FC<KkAvatarProps> = ({ initials, size = 'medium', component, sx }) => {
  const metrics = avatarMetrics[size];
  const componentProps = component === undefined ? {} : { component };

  return (
    <Avatar
      {...componentProps}
      data-kk-avatar
      sx={[
        (theme) => ({
          width: metrics.size,
          height: metrics.size,
          ...applyScheme(
            theme,
            schemeFill(kkTokens.color.light.avatar, kkTokens.color.dark.avatar),
          ),
          color: 'text.primary',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          fontSize: metrics.fontSize,
          letterSpacing: kkTokens.type.tracking.display,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials}
    </Avatar>
  );
};
