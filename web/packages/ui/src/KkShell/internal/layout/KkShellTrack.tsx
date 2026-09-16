import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea, safeAreaInset } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';
import { arrivalCascadeOf } from '../logic/arrival-cascade';
import { MAIN_ELEMENT_ID } from '../main-element-id';

const TRACK_PADDING_X = 2.5;
const ARRIVING_BLOCK = '& [data-kk-shell-entrance] > * > *';
const ARRIVAL_CASCADE = arrivalCascadeOf(ARRIVING_BLOCK, kkTokens.shell.screen.arrivalBlocks);

interface KkShellTrackProps extends PropsWithChildren {
  headClearance: number;
  footClearance: number;
  indexClearance: number;
}

export const KkShellTrack: FC<KkShellTrackProps> = ({
  headClearance,
  footClearance,
  indexClearance,
  children,
}) => (
  <Stack
    component="main"
    id={MAIN_ELEMENT_ID}
    tabIndex={-1}
    data-kk-shell-track
    sx={(theme) => ({
      flex: 1,
      minWidth: 0,
      outline: 'none',
      pt: safeArea('top', headClearance),
      pb: safeArea('bottom', footClearance),
      pl: `calc(${safeAreaInset('left')} + ${theme.spacing(TRACK_PADDING_X)})`,
      pr: `calc(${safeAreaInset('right')} + ${theme.spacing(TRACK_PADDING_X)} + ${indexClearance}px)`,
      transition: kkTokens.motion.clearance,
      ...ARRIVAL_CASCADE,
    })}
  >
    {children}
  </Stack>
);
