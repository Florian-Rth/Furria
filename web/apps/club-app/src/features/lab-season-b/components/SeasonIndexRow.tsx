import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import { INDEX_ROW_LABEL, toEveningsFact } from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import type { IndexEntry } from '../season-columns';
import { SeasonLineFact } from './SeasonLineFact';
import { SeasonReadiness } from './SeasonReadiness';

interface SeasonIndexRowProps {
  entry: IndexEntry;
  rowKey: string;
}

export const SeasonIndexRow: FC<SeasonIndexRowProps> = ({ entry, rowKey }) => {
  const board = useSeasonBoardContext();
  const actId = entry.act.actId;
  const state = board.markedActId === actId ? 'selected' : 'rest';
  const eveningsFact = toEveningsFact(entry.evenings, board.columns.length);
  const fact = <SeasonLineFact act={entry.act} extra={eveningsFact} />;
  const trailing = <SeasonReadiness name={entry.act.name} readiness={entry.readiness} />;
  const chips = <SeasonReadiness name={entry.act.name} readiness={entry.readiness} place="below" />;
  const mark = (): void => {
    board.mark(actId);
  };

  return (
    <KkNumberedList.Row
      rowKey={rowKey}
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
