import { KkDragGrip } from '@furria/ui/KkDragGrip';
import { KkIconButton } from '@furria/ui/KkIconButton';
import type { FC, KeyboardEvent, PointerEvent } from 'react';
import { usePlanner } from '../planner-context';
import {
  BRACKET_LABEL,
  DRAG_LABEL,
  PIN_LABEL,
  UNBRACKET_LABEL,
  UNPIN_LABEL,
} from '../planner-copy';
import type { PlannerLine } from '../planner-rows';

interface PlannerOrderTrailingProps {
  entry: PlannerLine;
}

export const PlannerOrderTrailing: FC<PlannerOrderTrailingProps> = ({ entry }) => {
  const planner = usePlanner();
  const { pinned, blockKey } = entry.line;
  const inBlock = blockKey !== null;
  const togglePin = (): void => {
    planner.togglePinOf(entry.key);
  };
  const startBracket = (event: PointerEvent<HTMLButtonElement>): void => {
    planner.bracket.start(entry.key, event);
  };
  const startDrag = (event: PointerEvent<HTMLButtonElement>): void => {
    planner.drag.start(entry.key, event);
  };
  const nudge = (event: KeyboardEvent<HTMLButtonElement>): void => {
    planner.drag.nudge(entry.key, event);
  };
  const handle = (
    <KkDragGrip
      icon="drag"
      label={DRAG_LABEL}
      gripKey={entry.key}
      concealed={pinned}
      onPointerDown={startDrag}
      onKeyDown={nudge}
    />
  );

  return (
    <>
      <KkIconButton
        label={pinned ? UNPIN_LABEL : PIN_LABEL}
        icon={pinned ? 'pinFilled' : 'pin'}
        size="small"
        pressed={pinned}
        onClick={togglePin}
      />
      <KkDragGrip
        icon={inBlock ? 'unblock' : 'link'}
        label={inBlock ? UNBRACKET_LABEL : BRACKET_LABEL}
        pressed={inBlock}
        active={planner.bracket.activeKey === entry.key}
        cursor="pointer"
        onPointerDown={startBracket}
      />
      {handle}
    </>
  );
};
