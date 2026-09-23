import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { inkWash, inkWashSurface } from '../../../internal/ink-wash';
import { logoInk } from '../../../internal/logo-ink';
import { KkBroomMark } from '../../../KkBroomMark';
import { emblemTile } from './emblem-tile';

const PLACEHOLDER_SIZE = 30;

interface KkSessionRowEmblemProps {
  source: string | null;
}

export const KkSessionRowEmblem: FC<KkSessionRowEmblemProps> = ({ source }) => {
  const content =
    source === null ? (
      <KkBroomMark size={PLACEHOLDER_SIZE} sx={(theme) => ({ color: inkWash(theme, '12%') })} />
    ) : (
      <Box
        component="img"
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
