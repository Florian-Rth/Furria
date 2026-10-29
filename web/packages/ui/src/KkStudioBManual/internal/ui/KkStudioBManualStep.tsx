import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, Ref } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkStudioBFormation } from '../../../KkStudioBStage/KkStudioBFormation';
import type { KkStudioBDot } from '../../../KkStudioBStage/studio-b-dot';
import { kkTokens } from '../../../tokens';
import {
  CURRENT_MARK_ID,
  HANDOVER,
  ROW_ENTER,
  ROW_FADE,
  ROW_LEAVE,
  ROW_REST,
} from '../studio-b-manual-motion';

const rowPaint =
  (current: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1.75rem minmax(0, 1fr) auto 2.25rem 1rem 2.75rem',
    alignItems: 'center',
    columnGap: theme.spacing(1),
    width: '100%',
    minHeight: kkTokens.tapTarget,
    px: 1,
    textAlign: 'left',
    borderRadius: `${kkTokens.radius.base}px`,
    backgroundColor: current ? (theme.vars ?? theme).palette.action.selected : 'transparent',
    transition: 'background-color 200ms ease-out',
    ...focusRing(theme),
    '@media (hover: hover)': {
      '&:hover': { backgroundColor: (theme.vars ?? theme).palette.action.hover },
    },
  });

const numberPaint =
  (current: boolean) =>
  (theme: Theme): CSSObject => ({
    fontFamily: kkTokens.font.display,
    typography: 'subtitle1',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...(current ? redInk(theme) : {}),
  });

const NAME = {
  typography: 'body2',
  fontWeight: 700,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const FIGURE = {
  typography: 'caption',
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
} as const;

const RANGE = { ...FIGURE, color: 'text.secondary' } as const;
const EIGHTS = { ...FIGURE, fontWeight: 800, textAlign: 'right' } as const;
const GLYPH = { width: '1rem', height: '1rem', color: 'text.secondary' } as const;

const CURRENT_MARK = {
  position: 'absolute',
  left: 0,
  top: '22%',
  bottom: '22%',
  width: kkTokens.line.page,
  borderRadius: `${kkTokens.radius.bar}px`,
  bgcolor: 'primary.main',
} as const;

export interface KkStudioBManualStepFormation {
  widthMetres: number;
  depthMetres: number;
  dots: readonly KkStudioBDot[];
}

interface KkStudioBManualStepProps {
  number: string;
  name: string;
  range: string;
  eights: string;
  label: string;
  hasVideo: boolean;
  formation: KkStudioBManualStepFormation;
  current?: boolean;
  onSelect: () => void;
  ref?: Ref<HTMLElement>;
}

export const KkStudioBManualStep: FC<KkStudioBManualStepProps> = ({
  number,
  name,
  range,
  eights,
  label,
  hasVideo,
  formation,
  current = false,
  onSelect,
  ref,
}) => {
  const glyph = hasVideo ? <VideocamOutlinedIcon aria-hidden sx={GLYPH} /> : <Box aria-hidden />;
  const ariaCurrent = current ? 'step' : undefined;
  const stepState = current ? 'current' : 'rest';
  const mark = current ? (
    <Box
      component={motion.span}
      aria-hidden
      layoutId={CURRENT_MARK_ID}
      transition={HANDOVER}
      sx={CURRENT_MARK}
    />
  ) : null;

  return (
    <Box
      component={motion.li}
      ref={ref}
      layout="position"
      initial={ROW_ENTER}
      animate={ROW_REST}
      exit={ROW_LEAVE}
      transition={ROW_FADE}
      data-kk-studio-b-step={stepState}
      sx={{ listStyle: 'none', minWidth: 0 }}
    >
      <ButtonBase
        aria-label={label}
        aria-current={ariaCurrent}
        onClick={onSelect}
        sx={rowPaint(current)}
      >
        {mark}
        <Box component="span" sx={numberPaint(current)}>
          {number}
        </Box>
        <Box component="span" sx={NAME}>
          {name}
        </Box>
        <Box component="span" sx={RANGE}>
          {range}
        </Box>
        <Box component="span" sx={EIGHTS}>
          {eights}
        </Box>
        {glyph}
        <KkStudioBFormation
          widthMetres={formation.widthMetres}
          depthMetres={formation.depthMetres}
          dots={formation.dots}
        />
      </ButtonBase>
    </Box>
  );
};
