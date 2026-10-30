import { KkChip } from '@furria/ui/KkChip';
import { KkIconButton } from '@furria/ui/KkIconButton';
import type { KkListRowState } from '@furria/ui/KkNumberedList';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import type { SeasonEvening } from '@/features/season/schemas';
import { ADJUSTED_CHIP, ROW_OPEN_LABEL, toCastChangeFact, toRemoveLabel } from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import type { ColumnLine } from '../season-columns';
import { SeasonLineCast } from './SeasonLineCast';
import { SeasonLineFact } from './SeasonLineFact';
import { SeasonReadiness } from './SeasonReadiness';

interface SeasonLineRowProps {
  evening: SeasonEvening;
  line: ColumnLine;
}

const stateOf = (open: boolean, marked: boolean): KkListRowState => {
  if (open) {
    return 'selected';
  }

  return marked ? 'marked' : 'rest';
};

export const SeasonLineRow: FC<SeasonLineRowProps> = ({ evening, line }) => {
  const board = useSeasonBoardContext();
  const actId = line.act.actId;
  const open = board.openLineKey === line.key;
  const state = stateOf(open, board.markedActId === actId);
  const changeFact = toCastChangeFact(line.appearance.removed.length, line.appearance.added.length);
  const adjusted = line.adjusted ? (
    <KkChip tone="gold" size="small">
      {ADJUSTED_CHIP}
    </KkChip>
  ) : null;
  const chips = (
    <>
      <SeasonReadiness name={line.act.name} readiness={line.readiness} place="below" />
      {adjusted}
    </>
  );
  const removing = board.isToggling(evening.eventId, actId);
  const canRemove = board.catalogueActOf(actId) !== null && !removing;
  const remove = (): void => {
    board.toggle(evening.eventId, actId, false);
  };
  const openCast = (): void => {
    board.toggleLine(line.key);
  };
  const removeLabel = toRemoveLabel(line.act.name, evening.title);
  const trailing = (
    <>
      <SeasonReadiness name={line.act.name} readiness={line.readiness} />
      <KkIconButton icon="close" label={removeLabel} disabled={!canRemove} onClick={remove} />
    </>
  );
  const number = line.number === null ? null : String(line.number);
  const fact = <SeasonLineFact act={line.act} extra={changeFact} />;
  const cast = open ? <SeasonLineCast eventId={evening.eventId} line={line} /> : null;

  return (
    <>
      <KkNumberedList.Row
        rowKey={line.key}
        number={number}
        title={line.act.name}
        mark={null}
        fact={fact}
        chips={chips}
        trailing={trailing}
        state={state}
        arrive={false}
        openLabel={ROW_OPEN_LABEL}
        onOpen={openCast}
      />
      {cast}
    </>
  );
};
