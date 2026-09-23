import Avatar from '@mui/material/Avatar';
import type { ElementType, FC } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldPaint } from './internal/group-tone';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkAvatarSize = 'small' | 'medium' | 'large';

interface KkAvatarMetrics {
  size: number;
  typography: 'caption' | 'h4' | 'h2';
}

const avatarMetrics: Record<KkAvatarSize, KkAvatarMetrics> = {
  small: { size: 26, typography: 'caption' },
  medium: { size: 40, typography: 'h4' },
  large: { size: 56, typography: 'h2' },
};

interface KkAvatarProps {
  initials: string;
  size?: KkAvatarSize;
  tone?: KkGroupTone;
  component?: ElementType;
  sx?: KkSx;
}

export const KkAvatar: FC<KkAvatarProps> = ({ initials, size = 'medium', tone, component, sx }) => {
  const metrics = avatarMetrics[size];
  const componentProps = component === undefined ? {} : { component };

  const paint: KkSx = (theme) =>
    tone === undefined
      ? {
          ...applyScheme(
            theme,
            schemeFill(kkTokens.color.light.avatar, kkTokens.color.dark.avatar),
          ),
          color: 'text.primary',
          borderColor: 'divider',
        }
      : { ...groupToneFieldPaint(theme, tone), borderColor: 'transparent' };

  return (
    <Avatar
      {...componentProps}
      data-kk-avatar
      sx={[
        {
          width: metrics.size,
          height: metrics.size,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          typography: metrics.typography,
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          letterSpacing: kkTokens.type.tracking.display,
        },
        paint,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials}
    </Avatar>
  );
};
