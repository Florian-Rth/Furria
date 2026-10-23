import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWashSurface } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkSpotlight = 'rest' | 'lit' | 'dimmed';

const SPOTLIGHT_OPACITY: Record<KkSpotlight, number> = { rest: 1, lit: 1, dimmed: 0.36 };
const SPOTLIGHT_TRANSITION = { duration: 0.24, ease: 'easeOut' } as const;
const BAR_WIDTH = 3;

const rowPaint =
  (spotlight: KkSpotlight, selected: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    minWidth: 0,
    ...(selected ? inkWashSurface(theme, '6%', '10%') : {}),
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 6,
      bottom: 6,
      width: BAR_WIDTH,
      borderRadius: `0 ${kkTokens.radius.bar}px ${kkTokens.radius.bar}px 0`,
      backgroundColor:
        spotlight === 'lit' || selected
          ? (theme.vars ?? theme).palette.primary.main
          : 'transparent',
      transition: 'background-color 200ms ease-out',
    },
    '& [data-kk-spotlight-mark]': {
      filter: spotlight === 'dimmed' ? 'grayscale(1)' : 'none',
      transition: 'filter 200ms ease-out',
    },
  });

const staticPaint: CSSObject = {
  flex: 1,
  minWidth: 0,
  alignItems: 'center',
  gap: 1.25,
  py: 1,
  pl: 1.5,
  pr: 1.5,
};

const mainPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  justifyContent: 'flex-start',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: 1.25,
  py: 1,
  pl: 1.5,
  pr: 1.5,
  textAlign: 'left',
  borderRadius: `${kkTokens.radius.base}px`,
  ...focusRing(theme),
  '@media (hover: hover)': {
    '&:hover [data-kk-spotlight-title]': redInk(theme),
  },
});

interface KkSpotlightListRowProps {
  rowKey: string;
  mark: ReactNode;
  title: string;
  fact?: ReactNode;
  chips?: ReactNode;
  trailing?: ReactNode;
  spotlight?: KkSpotlight;
  selected?: boolean;
  openLabel?: string;
  onOpen?: () => void;
}

export const KkSpotlightListRow: FC<KkSpotlightListRowProps> = ({
  rowKey,
  mark,
  title,
  fact,
  chips,
  trailing,
  spotlight = 'rest',
  selected = false,
  openLabel,
  onOpen,
}) => {
  const factLine =
    fact === undefined || fact === null ? null : (
      <Stack
        direction="row"
        component="span"
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 0.75,
          rowGap: 0.25,
          minWidth: 0,
          pt: 0.25,
          typography: 'caption',
          fontWeight: 600,
          lineHeight: 1.3,
          color: 'text.secondary',
          '& > span': { flexShrink: 0, whiteSpace: 'nowrap' },
          '& > span[data-kk-fact]:has(+ span[data-kk-fact])::after': { content: '"·"', ml: 0.75 },
        }}
      >
        {fact}
      </Stack>
    );
  const chipLine =
    chips === undefined || chips === null ? null : (
      <Stack
        direction="row"
        component="span"
        sx={{ flexWrap: 'wrap', gap: 0.5, pt: 0.5, minWidth: 0 }}
      >
        {chips}
      </Stack>
    );
  const trailingSlot =
    trailing === undefined || trailing === null ? null : (
      <Stack
        direction="row"
        data-kk-spotlight-trailing
        component="span"
        sx={{ flexShrink: 0, alignItems: 'center', gap: 0.5 }}
      >
        {trailing}
      </Stack>
    );

  const content = (
    <>
      <Box component="span" data-kk-spotlight-mark sx={{ display: 'inline-flex', flexShrink: 0 }}>
        {mark}
      </Box>
      <Stack component="span" sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="span"
          data-kk-spotlight-title
          sx={{
            typography: 'subtitle2',
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'text.primary',
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Box>
        {factLine}
        {chipLine}
      </Stack>
      {trailingSlot}
    </>
  );
  const main =
    onOpen === undefined ? (
      <Stack direction="row" sx={staticPaint}>
        {content}
      </Stack>
    ) : (
      <ButtonBase
        onClick={onOpen}
        aria-label={`${openLabel ?? title}: ${title}`}
        aria-current={selected ? 'true' : undefined}
        sx={mainPaint}
      >
        {content}
      </ButtonBase>
    );

  return (
    <Box
      component={motion.li}
      initial={false}
      animate={{ opacity: SPOTLIGHT_OPACITY[spotlight] }}
      transition={SPOTLIGHT_TRANSITION}
      data-kk-spotlight-row={rowKey}
      data-kk-spotlight={spotlight}
      sx={rowPaint(spotlight, selected)}
    >
      <Stack direction="row" sx={{ alignItems: 'stretch', minWidth: 0 }}>
        {main}
      </Stack>
    </Box>
  );
};
