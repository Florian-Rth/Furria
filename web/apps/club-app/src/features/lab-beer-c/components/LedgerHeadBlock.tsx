import { KkConfettiBurst } from '@furria/ui/KkConfettiBurst';
import type { KkLedgerFigure } from '@furria/ui/KkLedgerHead';
import { KkLedgerHead } from '@furria/ui/KkLedgerHead';
import { KkLedgerRoll } from '@furria/ui/KkLedgerRoll';
import { KkLedgerStatus } from '@furria/ui/KkLedgerStatus';
import type { KkStepState } from '@furria/ui/step-state';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  FIGURE_OPEN,
  FIGURE_OPEN_CRATES,
  FIGURE_PAID_CRATES,
  HEAD_LABEL,
  STATUS_CLEAR,
  STATUS_NONE,
  statusOpenText,
} from '../ledger-copy';
import { dayOf } from '../ledger-format';
import type { LedgerHead, LedgerStatus } from '../ledger-statement';

const CONFETTI_COUNT = 34;
const PRICE_LABEL = 'je Kiste';

const STATUS_STATES: Record<LedgerStatus, KkStepState> = {
  none: 'open',
  clear: 'done',
  open: 'open',
  overdue: 'overdue',
};

interface LedgerHeadBlockProps {
  head: LedgerHead;
  open: string;
  price: string;
  spin: number;
  stamp: string | null;
  fireKey: number;
}

const statusTextOf = (head: LedgerHead): string => {
  switch (head.status) {
    case 'none':
      return STATUS_NONE;
    case 'clear':
      return STATUS_CLEAR;
    default:
      return head.oldestOpenAt === null
        ? ''
        : statusOpenText(dayOf(head.oldestOpenAt), head.openDays ?? 0);
  }
};

export const LedgerHeadBlock: FC<LedgerHeadBlockProps> = ({
  head,
  open,
  price,
  spin,
  stamp,
  fireKey,
}) => {
  const roll = <KkLedgerRoll value={open} spin={spin} stamp={stamp} />;
  const openFigure: KkLedgerFigure = {
    key: 'open',
    label: FIGURE_OPEN,
    value: roll,
    tone: head.status === 'overdue' ? 'attention' : 'ink',
  };
  const figures: readonly KkLedgerFigure[] =
    head.status === 'none'
      ? [openFigure, { key: 'price', label: PRICE_LABEL, value: price, tone: 'quiet' }]
      : [
          openFigure,
          { key: 'openCount', label: FIGURE_OPEN_CRATES, value: String(head.openCount) },
          {
            key: 'paidCount',
            label: FIGURE_PAID_CRATES,
            value: String(head.paidCount),
            tone: 'quiet',
          },
        ];
  const statusText = statusTextOf(head);
  const status = <KkLedgerStatus state={STATUS_STATES[head.status]} text={statusText} />;

  return (
    <Box sx={{ position: 'relative' }}>
      <KkLedgerHead label={HEAD_LABEL} figures={figures} status={status} />
      <Box sx={{ position: 'absolute', left: '25%', top: '40%' }}>
        <KkConfettiBurst fireKey={fireKey} count={CONFETTI_COUNT} alwaysPlays />
      </Box>
    </Box>
  );
};
