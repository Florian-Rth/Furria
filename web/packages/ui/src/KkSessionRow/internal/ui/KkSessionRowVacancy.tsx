import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkIcon } from '../../../KkIcon';
import { emblemTile } from './emblem-tile';

export const KkSessionRowVacancy: FC = () => (
  <Stack
    aria-hidden
    data-kk-session-row-vacancy
    sx={(theme) => ({
      ...emblemTile(theme),
      borderStyle: 'dashed',
      borderColor: 'text.disabled',
      backgroundColor: 'transparent',
      ...redInk(theme),
    })}
  >
    <KkIcon name="add" size="small" />
  </Stack>
);
