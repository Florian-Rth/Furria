import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { highlightMark, highlightPaint } from '../../../internal/highlight-paint';
import { inkWashSurface } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

export type KkWorkQueueWhenTone = 'ink' | 'attention';

const ROW_X = { xs: 1.5, md: 2 } as const;
const WHEN_WIDTH = { xs: '4.25rem', md: '5.5rem' } as const;
const FADE_SECONDS = 0.2;
const FOLD_SECONDS = 0.24;

const shown = { opacity: 1, x: 0, height: 'auto' };
const entering = { opacity: 0, x: -12, height: 0 };
const leaving = { opacity: 0, x: 40, height: 0 };

const leaveTransition: Transition = {
  opacity: { duration: FADE_SECONDS, ease: 'easeOut' },
  x: { duration: FADE_SECONDS, ease: 'easeOut' },
  height: { duration: FOLD_SECONDS, delay: FADE_SECONDS * 0.6, ease: 'easeInOut' },
};
const settleTransition: Transition = { duration: FOLD_SECONDS, ease: 'easeOut' };
const INSTANT: Transition = { duration: 0 };

const whenInk = (theme: Theme, tone: KkWorkQueueWhenTone): CSSObject =>
  tone === 'attention' ? goldInkOf(theme) : { color: 'text.secondary' };

const mainPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 1.5,
    px: ROW_X,
    py: 1.25,
    textAlign: 'left',
    borderRadius: `${kkTokens.radius.base}px`,
    ...(selected ? inkWashSurface(theme, '6%', '10%') : {}),
    ...focusRing(theme),
    '@media (hover: hover)': {
      '&:hover [data-kk-work-queue-title]': redInk(theme),
    },
  });

interface KkWorkQueueRowProps {
  mark: ReactNode;
  title: string;
  fact: ReactNode;
  day?: string;
  relative?: string;
  whenTone?: KkWorkQueueWhenTone;
  action?: ReactNode;
  openLabel: string;
  selected?: boolean;
  landing?: string;
  highlight?: boolean;
  onOpen: () => void;
}

export const KkWorkQueueRow: FC<KkWorkQueueRowProps> = ({
  mark,
  title,
  fact,
  day,
  relative,
  whenTone = 'ink',
  action,
  openLabel,
  selected = false,
  landing,
  highlight = false,
  onOpen,
}) => {
  const reducedMotion = useReducedMotion();
  const exitTransition = reducedMotion ? INSTANT : leaveTransition;
  const enterTransition = reducedMotion ? INSTANT : settleTransition;
  const actionSlot =
    action === undefined || action === null ? null : (
      <Stack
        direction="row"
        data-kk-work-queue-action-slot
        sx={{ flexShrink: 0, alignItems: 'center', pr: ROW_X }}
      >
        {action}
      </Stack>
    );

  const when =
    day === undefined && relative === undefined ? null : (
      <Stack
        component="span"
        sx={{ flexShrink: 0, width: WHEN_WIDTH, alignItems: 'flex-end', gap: 0.125 }}
      >
        <Box
          component="span"
          sx={{
            ...stepFigures,
            typography: 'body2',
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {day}
        </Box>
        <Box
          component="span"
          sx={(theme) => ({
            ...stepFigures,
            typography: 'caption',
            fontWeight: 700,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            ...whenInk(theme, whenTone),
          })}
        >
          {relative}
        </Box>
      </Stack>
    );

  return (
    <Box
      component={motion.li}
      initial={entering}
      animate={{ ...shown, transition: enterTransition }}
      exit={{ ...leaving, transition: exitTransition }}
      data-kk-work-queue-row
      data-kk-landing={landing}
      {...highlightMark(highlight)}
      sx={(theme) => ({
        minWidth: 0,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderColor: 'divider',
        '&:first-of-type': { borderTopWidth: 0 },
        ...(highlight ? highlightPaint(theme) : {}),
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', minWidth: 0 }}>
        <ButtonBase
          onClick={onOpen}
          aria-label={`${openLabel}: ${title}`}
          aria-current={selected ? 'true' : undefined}
          sx={mainPaint(selected)}
        >
          {mark}
          <Stack component="span" sx={{ flex: 1, minWidth: 0, gap: 0.125 }}>
            <Box
              component="span"
              data-kk-work-queue-title
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
            <Stack
              direction="row"
              component="span"
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                columnGap: 0.5,
                typography: 'body2',
                lineHeight: 1.3,
                color: 'text.secondary',
                overflowWrap: 'anywhere',
              }}
            >
              {fact}
            </Stack>
          </Stack>
          {when}
        </ButtonBase>
        {actionSlot}
      </Stack>
    </Box>
  );
};
