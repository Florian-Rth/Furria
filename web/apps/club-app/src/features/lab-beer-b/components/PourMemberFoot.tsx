import { KkPourBar } from '@furria/ui/KkPourBar';
import type { FC } from 'react';
import { UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';
import type { PourMemberList } from '../hooks/use-pour-member-list';
import {
  bookConfirmOf,
  bookContextOf,
  bookedTextOf,
  COUNT_LABEL,
  countsOf,
  HOLD_HINT,
  holdLabelOf,
  STOCK_EMPTY_LINE,
  UNDO_LABEL,
} from '../pour-member-copy';

interface PourMemberFootProps {
  list: PourMemberList;
  owner: string;
}

export const PourMemberFoot: FC<PourMemberFootProps> = ({ list, owner }) => {
  const priceCents = list.world.pot.priceCents;
  const empty = list.member.maxCount === 0;
  const counts = countsOf(list.member.maxCount);
  const context = bookContextOf(list.openAfterCents, priceCents);
  const message = empty ? STOCK_EMPTY_LINE : list.message;
  const hold = {
    label: holdLabelOf(list.count),
    hint: HOLD_HINT,
    confirm: bookConfirmOf(list.count, priceCents, owner),
  };
  const bookedCount = list.pending?.crateIds.length ?? 0;
  const undo =
    list.pending === null
      ? null
      : {
          text: bookedTextOf(bookedCount),
          actionLabel: UNDO_LABEL,
          runKey: list.pending.runKey,
          durationMs: UNDO_WINDOW_MS,
          onUndo: list.undo,
        };

  return (
    <KkPourBar
      countLabel={COUNT_LABEL}
      counts={counts}
      count={list.count}
      onCount={list.chooseCount}
      context={context}
      message={message}
      hold={hold}
      disabled={empty}
      onCommit={list.book}
      undo={undo}
    />
  );
};
