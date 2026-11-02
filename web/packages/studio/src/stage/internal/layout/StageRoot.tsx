import type { KkStageInkDensity } from '@furria/ui/KkStageInk';
import { KkStageInk } from '@furria/ui/KkStageInk';
import type { KkSx, KkTheme } from '@furria/ui/kk-sx';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { StageViewpoint } from '../../../models/stage-view';
import type { StageExtent, StageFrame } from '../../stage-framing';
import {
  containedFrontOf,
  containedPlaneOf,
  frameKeyOf,
  frontAtTopOf,
  WHOLE_STAGE_FRAME,
} from '../../stage-framing';
import type { StageWork } from '../../stage-work';

export type StageFit = 'contain' | 'width';

export type StageFrameChange = 'fade' | 'follow';

export interface StageFloor extends StageExtent {
  artworkSvg: string | null;
}

const FADE = { duration: 0.36, ease: [0.22, 0.61, 0.36, 1] } as const;
const HIDDEN = { opacity: 0 } as const;
const SHOWN = { opacity: 1 } as const;
const THUMB_WIDTH = 6.5;
const FIELD = {
  position: 'absolute',
  inset: 0,
  containerType: 'size',
  pointerEvents: 'none',
} as const;
const FULL_WIDTH = { width: '100%' } as const;
const FOLLOWING = 'follow';
const thumbWidth = (theme: KkTheme): { width: string } => ({ width: theme.spacing(THUMB_WIDTH) });

interface StageRootProps extends PropsWithChildren {
  label?: string;
  stage: StageFloor;
  viewpoint: StageViewpoint;
  density?: KkStageInkDensity;
  fit?: StageFit;
  frame?: StageFrame;
  frontLabel?: string;
  centre?: boolean;
  frameChange?: StageFrameChange;
  work?: StageWork;
  overlay?: ReactNode;
  sx?: KkSx;
}

export const StageRoot: FC<StageRootProps> = ({
  label,
  stage,
  viewpoint,
  density = 'full',
  fit = 'width',
  frame = WHOLE_STAGE_FRAME,
  frontLabel,
  centre = false,
  frameChange = 'fade',
  work,
  overlay,
  sx,
  children,
}) => {
  const front = frontAtTopOf(viewpoint) ? 'top' : 'bottom';
  const described = density !== 'thumb';
  const describedRole = work === undefined ? 'img' : 'group';
  const role = described ? describedRole : undefined;
  const ariaLabel = described ? label : undefined;
  const ariaHidden = described ? undefined : true;
  const plane = (
    <KkStageInk density={density} front={front} artworkSvg={stage.artworkSvg} centre={centre} />
  );
  const sxList = Array.isArray(sx) ? sx : [sx];

  if (fit === 'contain') {
    const placed = containedPlaneOf(frame, stage, viewpoint);
    const frontPlace = containedFrontOf(frame, stage, viewpoint);
    const frontTag =
      frontLabel === undefined ? null : (
        <Box
          style={frontPlace}
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
        >
          <KkStageInk.Front text={frontLabel} />
        </Box>
      );

    const planeKey = frameChange === 'follow' ? FOLLOWING : frameKeyOf(frame);

    const contained = (
      <Box
        role={role}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        data-kk-stage={density}
        sx={[
          {
            position: 'relative',
            alignSelf: 'stretch',
            justifySelf: 'stretch',
            width: '100cqw',
            height: '100cqh',
            overflow: 'clip',
            userSelect: 'none',
          },
          ...sxList,
        ]}
      >
        <AnimatePresence initial={false}>
          <Box
            key={planeKey}
            component={motion.div}
            initial={HIDDEN}
            animate={SHOWN}
            exit={HIDDEN}
            transition={FADE}
            style={placed}
            sx={{ position: 'absolute' }}
          >
            {plane}
            <Box ref={work?.planeRef} sx={FIELD}>
              {children}
            </Box>
          </Box>
        </AnimatePresence>
        {frontTag}
      </Box>
    );

    if (work === undefined) {
      return contained;
    }

    return (
      <Box
        ref={work.areaRef}
        {...work.handlers}
        data-kk-stage-work
        sx={{
          position: 'relative',
          flex: 1,
          alignSelf: 'stretch',
          justifySelf: 'stretch',
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          containerType: 'size',
          touchAction: 'none',
        }}
      >
        {contained}
        {overlay}
      </Box>
    );
  }

  const aspectRatio = `${stage.widthMetres} / ${stage.depthMetres}`;
  const sizing = density === 'thumb' ? thumbWidth : FULL_WIDTH;
  const frontTag = frontLabel === undefined ? null : <KkStageInk.Front text={frontLabel} />;
  const direction = front === 'top' ? 'column' : 'column-reverse';

  return (
    <Stack
      role={role}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      data-kk-stage={density}
      direction={direction}
      sx={[
        sizing,
        { flexShrink: 0, minWidth: 0, alignItems: 'center', gap: 0.25, userSelect: 'none' },
        ...sxList,
      ]}
    >
      {frontTag}
      <Box sx={{ position: 'relative', width: '100%', aspectRatio }}>
        {plane}
        <Box sx={FIELD}>{children}</Box>
      </Box>
    </Stack>
  );
};
