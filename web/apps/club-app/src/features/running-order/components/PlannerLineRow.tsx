import type { KkListRowState } from '@furria/ui/KkNumberedList';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC, ReactNode } from 'react';
import { usePlanner } from '../planner-context';
import { OPEN_LABEL } from '../planner-copy';
import { showsPictureOf } from '../planner-modes';
import type { PlannerLine } from '../planner-rows';
import type { PlannerMode } from '../schemas';
import { PlannerCheckTrailing } from './PlannerCheckTrailing';
import { PlannerDragReadout } from './PlannerDragReadout';
import { PlannerLineFact } from './PlannerLineFact';
import { PlannerLineMark } from './PlannerLineMark';
import { PlannerOrderTrailing } from './PlannerOrderTrailing';
import { PlannerProposalChips } from './PlannerProposalChips';
import { PlannerProposalTake } from './PlannerProposalTake';

interface PlannerLineRowProps {
  entry: PlannerLine;
}

const trailingOf = (mode: PlannerMode, entry: PlannerLine, proposing: boolean): ReactNode => {
  if (proposing && mode === 'order') {
    return null;
  }

  switch (mode) {
    case 'pick':
      return null;
    case 'order':
      return <PlannerOrderTrailing entry={entry} />;
    case 'check':
      return <PlannerCheckTrailing entry={entry} />;
  }
};

export const PlannerLineRow: FC<PlannerLineRowProps> = ({ entry }) => {
  const planner = usePlanner();
  const act = entry.line.act;
  const lifted = planner.drag.draggingKeys.includes(entry.key);
  const row = planner.suggestion.rowOf(entry.key);
  const selected = planner.isWide && planner.selectedKey === entry.key;
  const state: KkListRowState = lifted
    ? 'lifted'
    : row !== null
      ? 'proposed'
      : selected
        ? 'selected'
        : 'rest';
  const leads = planner.drag.draggingKeys[0] === entry.key;
  const dragNumber = planner.drag.numberOf(entry.key);
  const number = String(dragNumber ?? entry.index + 1);
  const movedFrom = dragNumber === null ? (row?.from ?? null) : entry.index;
  const numberFrom = movedFrom === null ? null : String(movedFrom + 1);
  const dropEdge = planner.drag.drop?.key === entry.key ? planner.drag.drop.edge : null;
  const trailing =
    row === null ? (
      trailingOf(planner.mode, entry, planner.suggestion.isActive)
    ) : (
      <PlannerProposalTake lineKey={entry.key} />
    );
  const compact = !planner.isWide || planner.mode === 'order';
  const chips = row === null ? null : <PlannerProposalChips row={row} />;
  const fact = leads ? (
    <PlannerDragReadout />
  ) : (
    <PlannerLineFact act={act} cast={act.cast} compact={compact} />
  );
  const mark = showsPictureOf(planner.mode, planner.isWide) ? <PlannerLineMark act={act} /> : null;
  const open = (): void => {
    planner.select(entry.key);
  };

  return (
    <KkNumberedList.Row
      rowKey={entry.key}
      number={number}
      numberFrom={numberFrom}
      pinned={entry.line.pinned}
      bracket={entry.blockEdge}
      bracketPreview={planner.bracket.previewKeys.includes(entry.key)}
      mark={mark}
      title={act.name}
      fact={fact}
      chips={chips}
      trailing={trailing}
      state={state}
      shift={planner.drag.shift}
      dropEdge={dropEdge}
      openLabel={OPEN_LABEL}
      onOpen={open}
    />
  );
};
