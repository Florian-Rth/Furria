import { KkLedgerPersonRow } from '@furria/ui/KkLedgerPersonRow';
import type { KkStepState } from '@furria/ui/step-state';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import { phoneMetaText, ROW_STATE_LABELS } from '../ledger-copy';
import { dayOf } from '../ledger-format';
import type { PersonLine, RowState } from '../ledger-hub';
import { rowStateOf } from '../ledger-hub';

const NONE = '–';

const ROW_STEPS: Record<RowState, KkStepState> = {
  ended: 'off',
  overdue: 'overdue',
  open: 'open',
  clear: 'done',
  fresh: 'waiting',
};

interface HubPersonRowProps {
  line: PersonLine;
  selected: boolean;
  onOpen: (personId: number) => void;
}

export const HubPersonRow: FC<HubPersonRowProps> = ({ line, selected, onOpen }) => {
  const { person } = line;
  const name = `${person.firstName} ${person.lastName}`;
  const hasOpen = line.openCount > 0;
  const oldestDay = line.oldestOpenAt === null ? null : dayOf(line.oldestOpenAt);
  const rowState = rowStateOf(line);
  const state = ROW_STEPS[rowState];
  const stateLabel = ROW_STATE_LABELS[rowState];
  const openTone = hasOpen ? (line.overdue ? 'attention' : 'ink') : 'quiet';
  const oldestTone = line.overdue ? 'attention' : hasOpen ? 'ink' : 'quiet';
  const openCount = hasOpen ? String(line.openCount) : NONE;
  const openAmount = hasOpen ? euroOf(line.openCents) : NONE;
  const oldest = oldestDay ?? NONE;
  const paid = String(line.paidCount);
  const phoneMeta = phoneMetaText(line.openCount, oldestDay, line.paidCount);
  const open = (): void => {
    onOpen(person.id);
  };

  return (
    <KkLedgerPersonRow
      initials={person.initials}
      name={name}
      state={state}
      stateLabel={stateLabel}
      openCount={openCount}
      openAmount={openAmount}
      openTone={openTone}
      oldest={oldest}
      oldestTone={oldestTone}
      paid={paid}
      phoneMeta={phoneMeta}
      phoneMetaTone={oldestTone}
      selected={selected}
      onSelect={open}
    />
  );
};
