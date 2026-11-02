import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, MouseEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { percentOf, SCORE_FIGURES } from '../../../internal/score-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { KkScoreGlyph } from '../../../KkScoreGlyph/KkScoreGlyph';
import { kkTokens } from '../../../tokens';
import { stepsTop } from '../timeline-paint';

export interface KkTimelineStepBlock {
  key: number;
  number: number;
  name: string;
  from: number;
  to: number;
  movement: boolean;
  video: boolean;
  label: string;
}

const DROP = { y: '-140%', opacity: 0 } as const;
const LANDED = { y: '0%', opacity: 1 } as const;
const DROP_SECONDS = 0.42;
const BLOCK_CONTAINER = 'kk-timeline-step';

const blockPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  inset: '3px 1px 3px 1px',
  display: 'grid',
  alignContent: 'center',
  justifyItems: 'start',
  gap: 0.25,
  px: 0.625,
  minWidth: 0,
  borderRadius: `${kkTokens.radius.bar}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  backgroundColor: inkWash(theme, '5%'),
  color: 'text.primary',
  textAlign: 'left',
  containerType: 'inline-size',
  containerName: BLOCK_CONTAINER,
  overflow: 'clip',
  ...focusRing(theme),
  '&[data-selected="true"]': {
    borderColor: 'text.primary',
    borderWidth: kkTokens.line.section,
    backgroundColor: inkWash(theme, '10%'),
  },
  '&[data-active="true"]': {
    boxShadow: `inset 0 ${kkTokens.line.page}px 0 ${(theme.vars ?? theme).palette.primary.main}`,
  },
  '&[data-active="true"] [data-kk-timeline-step-number]': redInk(theme),
  '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '12%') } },
  [`@container ${BLOCK_CONTAINER} (max-width: 3.25rem)`]: {
    '& [data-kk-timeline-step-name]': { display: 'none' },
  },
  [`@container ${BLOCK_CONTAINER} (max-width: 1.25rem)`]: {
    '& [data-kk-timeline-step-glyphs]': { display: 'none' },
  },
});

interface KkTimelineStepProps {
  block: KkTimelineStepBlock;
  active: boolean;
  selected: boolean;
  interactive: boolean;
  dropDelay: number | null;
  onSelect: (key: number) => void;
}

export const KkTimelineStep: FC<KkTimelineStepProps> = ({
  block,
  active,
  selected,
  interactive,
  dropDelay,
  onSelect,
}) => {
  const reduced = useReducedMotion();
  const place = { left: percentOf(block.from), width: percentOf(block.to - block.from) };
  const initial = dropDelay === null || reduced ? false : DROP;
  const drop = {
    delay: dropDelay ?? 0,
    duration: DROP_SECONDS,
    ease: [0.34, 1.4, 0.64, 1] as const,
  };
  const select = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    onSelect(block.key);
  };
  const glyphs = (
    <Stack
      direction="row"
      component="span"
      data-kk-timeline-step-glyphs
      sx={{ gap: 0.375, alignItems: 'center' }}
    >
      <KkScoreGlyph kind="movement" present={block.movement} size="tiny" />
      <KkScoreGlyph kind="video" present={block.video} size="tiny" />
    </Stack>
  );
  const face = (
    <>
      <Stack
        direction="row"
        component="span"
        sx={{ alignItems: 'baseline', gap: 0.5, minWidth: 0, maxWidth: '100%' }}
      >
        <Box
          component="span"
          data-kk-timeline-step-number
          sx={{
            fontFamily: kkTokens.font.display,
            typography: 'caption',
            lineHeight: 1,
            ...SCORE_FIGURES,
          }}
        >
          {block.number}
        </Box>
        <Box
          component="span"
          data-kk-timeline-step-name
          sx={{
            typography: 'caption',
            fontWeight: 700,
            lineHeight: 1.1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'clip',
            textOverflow: 'ellipsis',
          }}
        >
          {block.name}
        </Box>
      </Stack>
      {glyphs}
    </>
  );
  const body = interactive ? (
    <ButtonBase
      aria-label={block.label}
      aria-pressed={selected}
      data-selected={selected}
      data-active={active}
      onClick={select}
      sx={blockPaint}
    >
      {face}
    </ButtonBase>
  ) : (
    <Box component="span" data-selected={selected} data-active={active} sx={blockPaint}>
      {face}
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={initial}
      animate={LANDED}
      transition={drop}
      style={place}
      sx={{
        position: 'absolute',
        top: stepsTop,
        bottom: 0,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    >
      {body}
    </Box>
  );
};
