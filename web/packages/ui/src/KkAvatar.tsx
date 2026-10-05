import Avatar from '@mui/material/Avatar';
import type { ElementType, FC } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldPaint } from './internal/group-tone';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkAvatarSize = 'small' | 'medium' | 'large';

interface KkAvatarMetrics {
  size: string;
  typography: 'caption' | 'h4' | 'h2';
}

const avatarMetrics: Record<KkAvatarSize, KkAvatarMetrics> = {
  small: { size: '1.625rem', typography: 'caption' },
  medium: { size: '2.5rem', typography: 'h4' },
  large: { size: '3.5rem', typography: 'h2' },
};

interface KkAvatarProps {
  initials: string;
  source?: string;
  size?: KkAvatarSize;
  tone?: KkGroupTone;
  component?: ElementType;
  sx?: KkSx;
}

export const KkAvatar: FC<KkAvatarProps> = ({
  initials,
  source,
  size = 'medium',
  tone,
  component,
  sx,
}) => {
  const metrics = avatarMetrics[size];
  const componentProps = component === undefined ? {} : { component };
  const portraitProps = source === undefined ? {} : { src: source, alt: initials };

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
      {...portraitProps}
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
