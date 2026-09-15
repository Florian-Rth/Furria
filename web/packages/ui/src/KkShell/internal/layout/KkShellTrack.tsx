import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { MAIN_ELEMENT_ID } from '../main-element-id';

const TRACK_PADDING_X = 2.5;
const TRACK_GAP = 3;

interface KkShellTrackProps extends PropsWithChildren {
  headClearance: number;
  footClearance: number;
}

export const KkShellTrack: FC<KkShellTrackProps> = ({ headClearance, footClearance, children }) => (
  <Stack
    component="main"
    id={MAIN_ELEMENT_ID}
    tabIndex={-1}
    data-kk-shell-track
    sx={{
      flex: 1,
      minWidth: 0,
      outline: 'none',
      pt: safeArea('top', headClearance),
      pb: safeArea('bottom', footClearance),
      px: TRACK_PADDING_X,
      gap: TRACK_GAP,
    }}
  >
    {children}
  </Stack>
);
