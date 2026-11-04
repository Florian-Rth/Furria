import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  ELEMENT_COUNT_LABEL,
  HALL_STATUS_LABEL,
  INSPECT_HALL_LABEL,
  INSPECT_SELECTION_LABEL,
  POLYLINE_CANCEL_LABEL,
  POLYLINE_DONE_LABEL,
  SAVE_STATE_LABELS,
  SIZE_COUNT_LABEL,
  toMeasureChipLabel,
} from '../hall-builder-copy';
import { hallSizeLabel } from '../hall-builder-view';
import { saveToneOf } from '../hall-status';

export const HallBuilderStatus: FC = () => {
  const builder = useHallBuilderContext();
  const { draft, document } = builder;
  const polylineChips =
    draft.kind === 'polyline' ? (
      <>
        <KkPlanStatusStrip.Chip
          label={POLYLINE_DONE_LABEL}
          icon="check"
          tone="done"
          onClick={builder.finishDraft}
        />
        <KkPlanStatusStrip.Chip
          label={POLYLINE_CANCEL_LABEL}
          icon="close"
          onClick={builder.dropDraft}
        />
      </>
    ) : null;
  const measured = builder.overlay.measure;
  const measureChip =
    draft.kind === 'measure' && draft.settled && measured !== null ? (
      <KkPlanStatusStrip.Chip
        label={toMeasureChipLabel(measured.label)}
        icon="ruler"
        onClick={builder.dropDraft}
      />
    ) : null;
  const inspectLabel = builder.selection.length > 0 ? INSPECT_SELECTION_LABEL : INSPECT_HALL_LABEL;
  const inspectChip = builder.isPhone ? (
    <KkPlanStatusStrip.Chip
      label={inspectLabel}
      icon="edit"
      pressed={builder.isInspectorOpen}
      onClick={builder.openInspector}
    />
  ) : null;

  const size = hallSizeLabel(document);
  const elementCount = String(document.elements.length);
  const saveLabel = SAVE_STATE_LABELS[builder.saveState];
  const saveTone = saveToneOf(builder.saveState);

  return (
    <KkPlanStatusStrip label={HALL_STATUS_LABEL}>
      <KkPlanStatusStrip.Count value={size} label={SIZE_COUNT_LABEL} />
      <KkPlanStatusStrip.Count value={elementCount} label={ELEMENT_COUNT_LABEL} />
      <KkPlanStatusStrip.Chip label={saveLabel} tone={saveTone} />
      {polylineChips}
      {measureChip}
      {inspectChip}
    </KkPlanStatusStrip>
  );
};
