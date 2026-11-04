import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from '../internal/ink-wash';
import { raisedSurface } from '../internal/raised-surface';
import { KkAvatar } from '../KkAvatar/KkAvatar';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkPourCrate } from './KkPourCrate';
import type { KkPourTabState } from './KkPourStateGlyph';
import { KkPourStateGlyph } from './KkPourStateGlyph';

const GLYPH_LIMIT = 3;
const TIME_COLUMN = '2.75rem';
const OWN_RAIL = '0.1875rem';

const ARRIVE: Transition = { type: 'spring', stiffness: 380, damping: 22, mass: 0.9 };
const POUR: Transition = { duration: 1.9, times: [0, 0.32, 1], ease: 'easeOut' };
const DROP_DELAY = 0.18;
const DROP_STEP = 0.14;

const RESTING = { opacity: 1, y: 0, scale: 1 } as const;
const ABOVE = { opacity: 0, y: -36, scale: 0.94 } as const;
const POURING = { scaleY: [0, 1, 1], opacity: [0.9, 1, 0] };
const DROPPED = { y: 0, opacity: 1, rotate: 0 } as const;
const LIFTED = { y: -44, opacity: 0, rotate: -14 } as const;

const dropOf = (index: number): Transition => ({
  type: 'spring',
  stiffness: 520,
  damping: 15,
  delay: DROP_DELAY + index * DROP_STEP,
});

const rowPaint =
  (own: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    isolation: 'isolate',
    alignItems: 'center',
    gap: 1,
    minHeight: kkTokens.tapTarget,
    py: 0.75,
    pl: 1,
    pr: 1,
    borderRadius: `${kkTokens.radius.base}px`,
    ...(own
      ? {
          ...raisedSurface(theme),
          boxShadow: `inset ${OWN_RAIL} 0 0 ${(theme.vars ?? theme).palette.text.primary}`,
        }
      : {}),
  });

const washPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  inset: 0,
  zIndex: -1,
  borderRadius: `${kkTokens.radius.base}px`,
  transformOrigin: 'bottom',
  backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} 20%, transparent)`,
  backgroundImage: `linear-gradient(to top, transparent 70%, ${inkWash(theme, '10%')} 100%)`,
});

interface KkPourEntryProps {
  time: string;
  initials: string;
  name: string;
  note: string | null;
  count: number;
  countLabel: string;
  own: boolean;
  state: KkPourTabState | null;
  stateLabel: string | null;
  fresh?: boolean;
  sx?: KkSx;
}

export const KkPourEntry: FC<KkPourEntryProps> = ({
  time,
  initials,
  name,
  note,
  count,
  countLabel,
  own,
  state,
  stateLabel,
  fresh = false,
  sx,
}) => {
  const glyphCount = count > GLYPH_LIMIT ? 1 : count;
  const crates = Array.from({ length: glyphCount }, (_, index) => (
    <motion.span
      key={index}
      style={{ display: 'block' }}
      initial={fresh ? LIFTED : false}
      animate={DROPPED}
      transition={dropOf(index)}
    >
      <KkPourCrate filled tone={fresh ? 'accent' : 'ink'} />
    </motion.span>
  ));
  const wash = fresh ? (
    <Box
      component={motion.span}
      aria-hidden
      initial={{ scaleY: 0, opacity: 0.9 }}
      animate={POURING}
      transition={POUR}
      sx={washPaint}
    />
  ) : null;
  const noteLine =
    note === null ? null : (
      <Typography variant="caption" noWrap sx={{ color: 'text.secondary', lineHeight: 1.25 }}>
        {note}
      </Typography>
    );
  const stateMark =
    state === null || stateLabel === null ? null : (
      <Stack
        direction="row"
        data-kk-pour-state={state}
        sx={{ alignItems: 'center', gap: 0.5, flexShrink: 0 }}
      >
        <KkPourStateGlyph state={state} />
        <Typography variant="caption" noWrap sx={{ fontWeight: 800, color: 'text.primary' }}>
          {stateLabel}
        </Typography>
      </Stack>
    );

  return (
    <motion.div initial={fresh ? ABOVE : false} animate={RESTING} transition={ARRIVE}>
      <Stack
        direction="row"
        data-kk-pour-entry
        data-own={own}
        sx={[rowPaint(own), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {wash}
        <Typography
          variant="caption"
          sx={{
            width: TIME_COLUMN,
            flexShrink: 0,
            color: 'text.secondary',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {time}
        </Typography>
        <KkAvatar initials={initials} size="small" />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: own ? 900 : 700, minWidth: 0 }}>
              {name}
            </Typography>
            {stateMark}
          </Stack>
          {noteLine}
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
          {crates}
        </Stack>
        <Typography
          variant="body2"
          noWrap
          sx={{
            flexShrink: 0,
            minWidth: '4.25rem',
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {countLabel}
        </Typography>
      </Stack>
    </motion.div>
  );
};
