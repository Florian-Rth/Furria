import Avatar from '@mui/material/Avatar';
import type { FC } from 'react';
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
  sx?: KkSx;
}

export const KkAvatar: FC<KkAvatarProps> = ({ initials, size = 'medium', sx }) => {
  const metrics = avatarMetrics[size];

  return (
    <Avatar
      data-kk-avatar
      sx={[
        {
          width: metrics.size,
          height: metrics.size,
          bgcolor: 'warning.main',
          color: 'warning.contrastText',
          fontFamily: kkTokens.font.display,
          fontSize: metrics.fontSize,
          letterSpacing: '0.04em',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials}
    </Avatar>
  );
};
