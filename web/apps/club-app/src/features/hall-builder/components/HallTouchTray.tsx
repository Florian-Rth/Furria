import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import { KkPlanTouch } from '@furria/ui/KkPlanTouch';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  DROP_LAST_POINT_LABEL,
  POLYLINE_CANCEL_LABEL,
  TOOL_DONE_LABEL,
  TOOL_TRAY_LABEL,
  TOUCH_TOOL_LABELS,
  toMeasureChipLabel,
} from '../hall-builder-copy';
import { HALL_TOOL_ICONS } from '../hall-builder-tools';

export const HallTouchTray: FC = () => {
  const builder = useHallBuilderContext();
  const { draft, tool } = builder;

  if (tool === 'select') {
    return null;
  }

  const measured = builder.overlay.measure;
  const measureChip =
    tool === 'measure' && draft.kind === 'measure' && draft.settled && measured !== null ? (
      <KkPlanStatusStrip.Chip
        label={toMeasureChipLabel(measured.label)}
        icon="ruler"
        onClick={builder.dropDraft}
      />
    ) : null;
  const polylineChips =
    draft.kind === 'polyline' ? (
      <>
        <KkPlanStatusStrip.Chip
          label={DROP_LAST_POINT_LABEL}
          icon="undo"
          onClick={builder.dropLastPoint}
        />
        <KkPlanStatusStrip.Chip
          label={POLYLINE_CANCEL_LABEL}
          icon="close"
          onClick={builder.dropDraft}
        />
      </>
    ) : null;

  return (
    <KkPlanTouch.Tray>
      <KkPlanStatusStrip label={TOOL_TRAY_LABEL}>
        <KkPlanStatusStrip.Chip
          label={TOUCH_TOOL_LABELS[tool]}
          icon={HALL_TOOL_ICONS[tool]}
          pressed
        />
        {measureChip}
        {polylineChips}
        <KkPlanStatusStrip.Chip
          label={TOOL_DONE_LABEL}
          icon="check"
          tone="done"
          onClick={builder.finishTool}
        />
      </KkPlanStatusStrip>
    </KkPlanTouch.Tray>
  );
};
