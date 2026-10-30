import { KkIconButton } from '@furria/ui/KkIconButton';
import type { KkListRowState } from '@furria/ui/KkNumberedList';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import type { SeasonEvening } from '@/features/season/schemas';
import { INDEX_ROW_LABEL, toAddLabel } from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import type { ColumnAbsentAct } from '../season-columns';
import { SeasonLineFact } from './SeasonLineFact';
import { SeasonReadiness } from './SeasonReadiness';

interface SeasonAbsentRowProps {
  evening: SeasonEvening;
  entry: ColumnAbsentAct;
}

export const SeasonAbsentRow: FC<SeasonAbsentRowProps> = ({ evening, entry }) => {
  const board = useSeasonBoardContext();
  const actId = entry.act.actId;
  const state: KkListRowState = board.markedActId === actId ? 'marked' : 'rest';
  const adding = board.isToggling(evening.eventId, actId);
  const canAdd = board.catalogueActOf(actId) !== null && !adding;
  const addLabel = toAddLabel(entry.act.name, evening.title);
  const add = (): void => {
    board.toggle(evening.eventId, actId, true);
  };
  const mark = (): void => {
    board.mark(actId);
  };
  const fact = <SeasonLineFact act={entry.act} />;
  const chips = <SeasonReadiness name={entry.act.name} readiness={entry.readiness} place="below" />;
  const trailing = (
    <>
      <SeasonReadiness name={entry.act.name} readiness={entry.readiness} />
      <KkIconButton icon="add" label={addLabel} disabled={!canAdd} onClick={add} />
    </>
  );

  return (
    <KkNumberedList.Row
      rowKey={entry.key}
      number={null}
      title={entry.act.name}
      mark={null}
      fact={fact}
      chips={chips}
      trailing={trailing}
      state={state}
      arrive={false}
      openLabel={INDEX_ROW_LABEL}
      onOpen={mark}
    />
  );
};
