import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea, safeAreaInset } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';
import { arrivalCascadeOf } from '../logic/arrival-cascade';
import { MAIN_ELEMENT_ID } from '../main-element-id';

const TRACK_PADDING_X = 2.5;
const ARRIVING_BLOCK = '& [data-kk-shell-entrance] > * > *';

interface KkShellTrackProps extends PropsWithChildren {
  headClearance: number;
  footClearance: number;
  indexClearance: number;
  arrivalBlocks?: number;
}

export const KkShellTrack: FC<KkShellTrackProps> = ({
  headClearance,
  footClearance,
  indexClearance,
  arrivalBlocks = kkTokens.shell.screen.arrivalBlocks,
  children,
}) => {
  const arrivalCascade = arrivalCascadeOf(ARRIVING_BLOCK, arrivalBlocks);

  return (
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
        ...arrivalCascade,
      })}
    >
      {children}
    </Stack>
  );
};
