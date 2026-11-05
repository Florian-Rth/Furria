import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';
import type { KkTabLedgerState } from './KkTabLedgerMark';
import { KkTabLedgerMark } from './KkTabLedgerMark';

const DAY_WIDTH = '5.25rem';
const FADED: readonly KkTabLedgerState[] = ['paid', 'stays'];

const shown = { opacity: 1, height: 'auto' };
const hidden = { opacity: 0, height: 0 };
const fold = { duration: 0.22, ease: 'easeOut' } as const;

const notePaint =
  (attention: boolean) =>
  (theme: Theme): CSSObject => ({
    typography: 'caption',
    fontWeight: 700,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    ...(attention ? goldInkOf(theme) : { color: 'text.secondary' }),
  });

interface KkTabLedgerLineProps {
  state: KkTabLedgerState;
  day: string;
  label: string;
  note?: string;
  noteAttention?: boolean;
  amount?: string;
}

export const KkTabLedgerLine: FC<KkTabLedgerLineProps> = ({
  state,
  day,
  label,
  note,
  noteAttention = false,
  amount,
}) => {
  const faded = FADED.includes(state);
  const noteSlot =
    note === undefined ? null : (
      <Box component="span" sx={notePaint(noteAttention)}>
        {note}
      </Box>
    );
  const amountSlot =
    amount === undefined ? null : (
      <Box
        component="span"
        sx={{
          ...stepFigures,
          flexShrink: 0,
          typography: 'body2',
          fontWeight: 800,
          lineHeight: 1.25,
          color: faded ? 'text.disabled' : 'text.primary',
          textDecoration: state === 'paid' ? 'line-through' : 'none',
          textDecorationThickness: '1px',
        }}
      >
        {amount}
      </Box>
    );

  return (
    <Box
      component={motion.li}
      initial={hidden}
      animate={shown}
      exit={hidden}
      transition={fold}
      data-kk-tab-ledger-line={state}
      sx={{
        minWidth: 0,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderTopColor: 'divider',
        '&:first-of-type': { borderTopWidth: 0 },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 1.5, py: 0.75, minWidth: 0 }}>
        <KkTabLedgerMark state={state} />
        <Box
          component="span"
          sx={{
            ...stepFigures,
            flexShrink: 0,
            width: DAY_WIDTH,
            typography: 'body2',
            fontWeight: 700,
            lineHeight: 1.25,
            color: faded ? 'text.secondary' : 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {day}
        </Box>
        <Stack
          direction="row"
          sx={{ flex: 1, minWidth: 0, alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}
        >
          <Box
            component="span"
            sx={{
              typography: 'body2',
              lineHeight: 1.25,
              color: faded ? 'text.secondary' : 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            {label}
          </Box>
          {noteSlot}
        </Stack>
        {amountSlot}
      </Stack>
    </Box>
  );
};
