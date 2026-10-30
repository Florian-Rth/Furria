import { KkButton } from '@furria/ui/KkButton';
import { KkDragGrip } from '@furria/ui/KkDragGrip';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC, KeyboardEvent, PointerEvent } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import { DRAG_LABEL, OPEN_LABEL, PLACE_LABEL } from '../planner-copy';
import { PlannerLineFact } from './PlannerLineFact';
import { PlannerLineMark } from './PlannerLineMark';

interface PlannerUnplacedRowProps {
  line: DraftLine;
}

export const PlannerUnplacedRow: FC<PlannerUnplacedRowProps> = ({ line }) => {
  const planner = usePlanner();
  const act = line.act;
  const lifted = planner.drag.draggingKeys.includes(line.key);
  const place = (): void => {
    planner.place(line.key);
  };
  const open = (): void => {
    planner.select(line.key);
  };
  const startDrag = (event: PointerEvent<HTMLButtonElement>): void => {
    planner.drag.start(line.key, event);
  };
  const nudge = (event: KeyboardEvent<HTMLButtonElement>): void => {
    planner.drag.nudge(line.key, event);
  };
  const ordering = planner.mode === 'order';
  const proposing = planner.suggestion.isActive || planner.suggestion.isLoading;
  const grip =
    ordering && !proposing ? (
      <KkDragGrip
        icon="drag"
        label={DRAG_LABEL}
        gripKey={line.key}
        active={lifted}
        onPointerDown={startDrag}
        onKeyDown={nudge}
      />
    ) : null;
  const placeButton = ordering ? (
    <KkIconButton label={PLACE_LABEL} icon="add" size="small" onClick={place} />
  ) : (
    <KkButton size="small" variant="outlined" onClick={place}>
      {PLACE_LABEL}
    </KkButton>
  );
  const mark = planner.isWide ? <PlannerLineMark act={act} /> : null;
  const action = proposing ? null : (
    <>
      {placeButton}
      {grip}
    </>
  );

  return (
    <KkNumberedList.Row
      rowKey={line.key}
      number={null}
      mark={mark}
      title={act.name}
      fact={
        <PlannerLineFact
          act={act}
          cast={act.cast}
          compact={!planner.isWide || ordering}
          eveningChanges={line.eveningChanges}
          archived={planner.isArchived(act.actId)}
        />
      }
      openLabel={OPEN_LABEL}
      onOpen={open}
      trailing={action}
      state={lifted ? 'lifted' : 'rest'}
      shift={planner.drag.shift}
    />
  );
};
