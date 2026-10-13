import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../internal/gold-ink';
import { skeletonSurface } from '../internal/skeleton-shimmer';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkSlotKind } from './internal/slot-strip';
import { slotStripOf } from './internal/slot-strip';

const { system } = kkTokens;

const slotFrame: CSSObject = {
  width: system.slot,
  height: system.slot,
  flexShrink: 0,
  borderRadius: `${kkTokens.radius.bar / 1.5}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
};

const slotPaints: Record<KkSlotKind, (theme: Theme) => CSSObject> = {
  running: (theme) => ({ ...skeletonSurface(theme), borderColor: 'text.primary' }),
  retrying: (theme) => ({
    ...goldInkOf(theme),
    borderColor: 'currentColor',
    backgroundColor: 'currentColor',
  }),
  queued: () => ({ borderColor: 'text.disabled', backgroundColor: 'transparent' }),
};

interface KkSlotStripProps {
  label: string;
  running: number;
  retrying: number;
  queued: number;
  aside?: string;
  sx?: KkSx;
}

export const KkSlotStrip: FC<KkSlotStripProps> = ({
  label,
  running,
  retrying,
  queued,
  aside,
  sx,
}) => {
  const strip = slotStripOf(running, retrying, queued, system.slotCap);
  const slots = strip.cells.map((cell) => (
    <Box
      key={cell.key}
      data-kk-slot={cell.kind}
      sx={(theme) => ({ ...slotFrame, ...slotPaints[cell.kind](theme) })}
    />
  ));
  const overflow =
    strip.overflow === 0 ? null : (
      <Typography
        component="span"
        variant="h4"
        sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
      >
        {`+${strip.overflow}`}
      </Typography>
    );
  const asideLine =
    aside === undefined ? null : (
      <Typography
        component="span"
        sx={{ typography: 'caption', fontWeight: 700, color: 'text.secondary' }}
      >
        {aside}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-slot-strip
      sx={[
        { alignItems: 'center', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.75, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        direction="row"
        role="img"
        aria-label={label}
        sx={{ alignItems: 'center', flexWrap: 'wrap', gap: `${system.slotGap}px`, minWidth: 0 }}
      >
        {slots}
        {overflow}
      </Stack>
      {asideLine}
    </Stack>
  );
};
