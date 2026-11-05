import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  ELEMENT_COUNT_LABEL,
  HALL_STATUS_LABEL,
  INSPECT_HALL_LABEL,
  REDO_LABEL,
  SAVE_STATE_LABELS,
  SIZE_COUNT_LABEL,
  UNDO_LABEL,
} from '../hall-builder-copy';
import { hallSizeLabel } from '../hall-builder-view';
import { saveToneOf } from '../hall-status';

export const HallTouchTop: FC = () => {
  const builder = useHallBuilderContext();
  const size = hallSizeLabel(builder.document);
  const elementCount = String(builder.document.elements.length);
  const saveLabel = SAVE_STATE_LABELS[builder.saveState];
  const saveTone = saveToneOf(builder.saveState);

  return (
    <KkPlanStatusStrip label={HALL_STATUS_LABEL}>
      <KkPlanStatusStrip.Action
        id="undo"
        label={UNDO_LABEL}
        icon="undo"
        disabled={!builder.canUndo}
        onClick={builder.undo}
      />
      <KkPlanStatusStrip.Action
        id="redo"
        label={REDO_LABEL}
        icon="redo"
        disabled={!builder.canRedo}
        onClick={builder.redo}
      />
      <KkPlanStatusStrip.Count value={size} label={SIZE_COUNT_LABEL} />
      <KkPlanStatusStrip.Count value={elementCount} label={ELEMENT_COUNT_LABEL} />
      <KkPlanStatusStrip.Chip label={saveLabel} tone={saveTone} />
      <KkPlanStatusStrip.Chip
        label={INSPECT_HALL_LABEL}
        icon="settings"
        onClick={builder.inspectHall}
      />
    </KkPlanStatusStrip>
  );
};
