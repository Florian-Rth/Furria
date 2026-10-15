import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { inkWashSurface } from '../../../internal/ink-wash';
import { logoInk } from '../../../internal/logo-ink';
import { KkImage } from '../../../KkImage';
import { KkPhoto } from '../../../KkPhoto';
import { emblemTile } from './emblem-tile';

interface KkSessionRowEmblemProps {
  source: string | null;
}

export const KkSessionRowEmblem: FC<KkSessionRowEmblemProps> = ({ source }) => {
  const content =
    source === null ? (
      <KkPhoto alt="" fill />
    ) : (
      <KkImage
        src={source}
        alt=""
        sx={(theme) => ({
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          ...logoInk(theme),
        })}
      />
    );

  return (
    <Stack
      aria-hidden
      data-kk-session-row-emblem
      sx={(theme) => ({ ...emblemTile(theme), ...inkWashSurface(theme, '3%', '5%') })}
    >
      {content}
    </Stack>
  );
};
