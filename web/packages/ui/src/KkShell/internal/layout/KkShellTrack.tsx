import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea, safeAreaInset } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';
import { arrivalCascadeOf } from '../logic/arrival-cascade';
import { MAIN_ELEMENT_ID } from '../main-element-id';
import { TRACK_EDGE } from '../track-edge';

const TRACK_PADDING_X = 2.5;
const ARRIVING_BLOCK = '& [data-kk-shell-entrance] > * > *';
const HELD_BODY_BLOCK = '& [data-kk-shell-entrance][data-kk-body-held] > * ~ * > *';
const HELD = { animationPlayState: 'paused' } as const;

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
        [TRACK_EDGE.top]: safeArea('top', headClearance),
        [TRACK_EDGE.bottom]: safeArea('bottom', footClearance),
        [TRACK_EDGE.left]: `calc(${safeAreaInset('left')} + ${theme.spacing(TRACK_PADDING_X)})`,
        [TRACK_EDGE.right]: `calc(${safeAreaInset('right')} + ${theme.spacing(TRACK_PADDING_X)} + ${indexClearance}px)`,
        pt: `var(${TRACK_EDGE.top})`,
        pb: `var(${TRACK_EDGE.bottom})`,
        pl: `var(${TRACK_EDGE.left})`,
        pr: `var(${TRACK_EDGE.right})`,
        transition: kkTokens.motion.clearance,
        ...arrivalCascade,
        [HELD_BODY_BLOCK]: HELD,
      })}
    >
      {children}
    </Stack>
  );
};
