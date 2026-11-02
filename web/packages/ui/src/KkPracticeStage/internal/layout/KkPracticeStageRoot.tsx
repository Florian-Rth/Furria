import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from '../../../internal/stretched-svg-source';
import { KkPhoto } from '../../../KkPhoto';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

export interface KkPracticeStageFrame {
  left: number;
  top: number;
  width: number;
  height: number;
}

const FRONT_ROOM = '1rem';
const DOT_ROOM = '1.25rem';
const VEIL = '16%';
const FADE_SECONDS = 0.36;
const FADE_EASE = [0.22, 0.61, 0.36, 1] as const;
const HIDDEN = { opacity: 0 } as const;
const SHOWN = { opacity: 1 } as const;
const HALF = 0.5;
const SCALE = '--kk-stage-metre';
const WHOLE_STAGE: KkPracticeStageFrame = { left: 0, top: 0, width: 1, height: 1 };

const planeStyleOf = (
  frame: KkPracticeStageFrame,
  widthMetres: number,
  depthMetres: number,
): Record<string, string> => {
  const frameWidth = frame.width * widthMetres;
  const frameDepth = frame.height * depthMetres;
  const centreX = (frame.left + frame.width * HALF) * widthMetres;
  const centreY = (frame.top + frame.height * HALF) * depthMetres;

  return {
    [SCALE]: `min(calc((100cqw - 2 * ${DOT_ROOM}) / ${frameWidth}), calc((100cqh - ${FRONT_ROOM} - ${DOT_ROOM}) / ${frameDepth}))`,
    width: `calc(var(${SCALE}) * ${widthMetres})`,
    height: `calc(var(${SCALE}) * ${depthMetres})`,
    left: `calc(50cqw - var(${SCALE}) * ${centreX})`,
    top: `calc(${FRONT_ROOM} + (100cqh - ${FRONT_ROOM}) / 2 - var(${SCALE}) * ${centreY})`,
  };
};

const labelTopOf = (frame: KkPracticeStageFrame, depthMetres: number): string => {
  const centreY = (frame.top + frame.height * HALF) * depthMetres;
  return `max(0px, calc((100cqh - ${FRONT_ROOM}) / 2 - var(${SCALE}) * ${centreY}))`;
};

interface KkPracticeStageRootProps extends PropsWithChildren {
  label: string;
  frontLabel: string;
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  frame?: KkPracticeStageFrame;
  frameKey?: string;
  sx?: KkSx;
}

export const KkPracticeStageRoot: FC<KkPracticeStageRootProps> = ({
  label,
  frontLabel,
  widthMetres,
  depthMetres,
  artworkSvg,
  frame = WHOLE_STAGE,
  frameKey = 'whole',
  sx,
  children,
}) => {
  const source = stretchedSvgSourceOf(artworkSvg);
  const artwork =
    source === null ? null : (
      <KkPhoto
        alt=""
        image={{ src: source }}
        fit="fill"
        fill
        priority
        sx={{ position: 'absolute', inset: 0, transform: 'rotate(180deg)', pointerEvents: 'none' }}
      />
    );
  const plane = planeStyleOf(frame, widthMetres, depthMetres);
  const labelTop = { [SCALE]: plane[SCALE] ?? '0px', top: labelTopOf(frame, depthMetres) };

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-practice-stage
      sx={[
        {
          position: 'relative',
          alignSelf: 'stretch',
          justifySelf: 'stretch',
          width: '100cqw',
          height: '100cqh',
          overflow: 'clip',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <AnimatePresence initial={false}>
        <Box
          key={frameKey}
          component={motion.div}
          initial={HIDDEN}
          animate={SHOWN}
          exit={HIDDEN}
          transition={{ duration: FADE_SECONDS, ease: FADE_EASE }}
          style={plane}
          data-kk-practice-plane
          sx={(theme) => ({
            position: 'absolute',
            borderRadius: { xs: 0, desktop: `${kkTokens.radius.base}px` },
            backgroundColor: (theme.vars ?? theme).palette.background.paper,
            boxShadow: kkTokens.shadow.raised,
          })}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              overflow: 'clip',
              '& > *': { borderRadius: 0 },
            }}
          >
            {artwork}
            <Box
              sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} ${VEIL}, transparent)`,
              })}
            />
            <Box
              sx={(theme) => ({
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: kkTokens.line.page,
                backgroundColor: (theme.vars ?? theme).palette.text.primary,
              })}
            />
          </Box>
          <Box
            data-kk-practice-field
            sx={{ position: 'absolute', inset: 0, containerType: 'size', pointerEvents: 'none' }}
          >
            {children}
          </Box>
        </Box>
      </AnimatePresence>
      <Typography
        aria-hidden
        variant="overline"
        style={labelTop}
        sx={(theme) => ({
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          px: 0.75,
          borderRadius: `${kkTokens.radius.pill}px`,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.eyebrow.letterSpacing,
          lineHeight: FRONT_ROOM,
          whiteSpace: 'nowrap',
          color: (theme.vars ?? theme).palette.text.secondary,
          backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} 70%, transparent)`,
        })}
      >
        {frontLabel}
      </Typography>
    </Box>
  );
};
