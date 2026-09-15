import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { MAIN_ELEMENT_ID } from '../main-element-id';

const TRACK_PADDING_X = 2.5;
const TRACK_GAP = 3;
const NO_CLEARANCE = 0;

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
      pl: TRACK_PADDING_X,
      pr:
        indexClearance === NO_CLEARANCE
          ? theme.spacing(TRACK_PADDING_X)
          : `calc(${theme.spacing(TRACK_PADDING_X)} + ${indexClearance}px)`,
      gap: TRACK_GAP,
    })}
  >
    {children}
  </Stack>
);
