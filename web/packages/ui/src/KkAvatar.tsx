import Avatar from '@mui/material/Avatar';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const AVATAR_SIZE = 40;

interface KkAvatarProps {
  initials: string;
  sx?: KkSx;
}

export const KkAvatar: FC<KkAvatarProps> = ({ initials, sx }) => (
  <Avatar
    data-kk-avatar
    sx={[
      {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        bgcolor: 'warning.main',
        color: 'warning.contrastText',
        fontFamily: kkTokens.font.display,
        fontSize: '1.0625rem',
        letterSpacing: '0.04em',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {initials}
  </Avatar>
);
