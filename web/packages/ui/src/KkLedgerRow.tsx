import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkIcon } from './KkIcon';
import { KkStatePill } from './KkStatePill/KkStatePill';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkStepState } from './KkStatePill/step-state';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkLedgerRail = 'none' | 'single' | 'top' | 'middle' | 'bottom';

export type KkLedgerRowKind = 'crate' | 'settlement';

export const KK_LEDGER_RAIL_WIDTH = '0.875rem';
export const KK_LEDGER_DAY_WIDTH = '2.875rem';
export const KK_LEDGER_AMOUNT_WIDTH = '4.25rem';

const RAIL_X = '0.25rem';
const TICK = '0.4375rem';
const STROKE = `${kkTokens.line.section}px`;

const railSpan: Record<Exclude<KkLedgerRail, 'none'>, { top: string; bottom: string }> = {
  single: { top: '38%', bottom: '38%' },
  top: { top: '50%', bottom: '0' },
  middle: { top: '0', bottom: '0' },
  bottom: { top: '0', bottom: '50%' },
};

const TICKED: readonly KkLedgerRail[] = ['single', 'top', 'bottom'];

const rowPaint =
  (kind: KkLedgerRowKind, fresh: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    alignItems: 'center',
    minHeight: '2.75rem',
    gap: 1,
    pr: 0.5,
    borderBottomWidth: kkTokens.line.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: (theme.vars ?? theme).palette.divider,
    backgroundColor:
      kind === 'settlement' ? (theme.vars ?? theme).palette.action.hover : 'transparent',
    animation: fresh ? kkTokens.motion.rowHighlight : 'none',
  });

interface KkLedgerRowProps {
  kind: KkLedgerRowKind;
  rail: KkLedgerRail;
  day: string;
  time: string;
  state?: KkStepState;
  stateLabel?: string;
  title?: string;
  meta?: string | null;
  amount: string;
  amountQuiet?: boolean;
  balance: string;
  fresh?: boolean;
  sx?: KkSx;
}

export const KkLedgerRow: FC<KkLedgerRowProps> = ({
  kind,
  rail,
  day,
  time,
  state = 'open',
  stateLabel = '',
  title = '',
  meta = null,
  amount,
  amountQuiet = false,
  balance,
  fresh = false,
  sx,
}) => {
  const railLine =
    rail === 'none' ? null : (
      <Box
        component="span"
        aria-hidden
        sx={{
          position: 'absolute',
          left: RAIL_X,
          width: STROKE,
          top: railSpan[rail].top,
          bottom: railSpan[rail].bottom,
          bgcolor: 'text.primary',
        }}
      />
    );
  const railTick = !TICKED.includes(rail) ? null : (
    <Box
      component="span"
      aria-hidden
      sx={{
        top: '50%',
        position: 'absolute',
        left: RAIL_X,
        width: TICK,
        height: STROKE,
        bgcolor: 'text.primary',
      }}
    />
  );
  const lead =
    kind === 'settlement' ? (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        <KkIcon name="fees" sx={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
        <Box
          component="span"
          sx={{
            ...stepFigures,
            typography: 'body2',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Box>
      </Stack>
    ) : (
      <KkStatePill state={state} label={stateLabel} />
    );
  const metaLine =
    meta === null ? null : (
      <Box
        component="span"
        sx={{
          ...stepFigures,
          typography: 'caption',
          lineHeight: 1.3,
          color: 'text.secondary',
        }}
      >
        {meta}
      </Box>
    );

  return (
    <Stack
      direction="row"
      component="li"
      data-kk-ledger-row={kind}
      sx={[rowPaint(kind, fresh), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          position: 'relative',
          alignSelf: 'stretch',
          width: KK_LEDGER_RAIL_WIDTH,
          flexShrink: 0,
        }}
      >
        {railLine}
        {railTick}
      </Box>
      <Stack sx={{ ...stepFigures, width: KK_LEDGER_DAY_WIDTH, flexShrink: 0, lineHeight: 1.2 }}>
        <Box component="span" sx={{ typography: 'caption', fontWeight: 800 }}>
          {day}
        </Box>
        <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
          {time}
        </Box>
      </Stack>
      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25, py: 0.75 }}>
        {lead}
        {metaLine}
      </Stack>
      <Box
        component="span"
        sx={{
          ...stepFigures,
          width: KK_LEDGER_AMOUNT_WIDTH,
          flexShrink: 0,
          textAlign: 'right',
          typography: 'body2',
          fontWeight: amountQuiet ? 600 : 800,
          color: amountQuiet ? 'text.secondary' : 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        {amount}
      </Box>
      <Box
        component="span"
        sx={{
          ...stepFigures,
          width: KK_LEDGER_AMOUNT_WIDTH,
          flexShrink: 0,
          textAlign: 'right',
          typography: 'caption',
          fontWeight: 700,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {balance}
      </Box>
    </Stack>
  );
};
