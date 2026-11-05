import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import type { FC } from 'react';
import { findingsToneOf } from '../planner-status';
import { useTablePlannerContext } from '../table-planner-context';
import {
  CHAIRS_COUNT_LABEL,
  PLAN_FACTS_LABEL,
  REDO_LABEL,
  STATUS_LABEL,
  TABLES_COUNT_LABEL,
  toFindingsChipLabel,
  UNDO_LABEL,
} from '../table-planner-copy';

export const TablePlannerTouchTop: FC = () => {
  const planner = useTablePlannerContext();
  const openFindings = (): void => {
    planner.openDrawer('findings');
  };

  return (
    <KkPlanStatusStrip label={STATUS_LABEL}>
      <KkPlanStatusStrip.Action
        id="undo"
        label={UNDO_LABEL}
        icon="undo"
        disabled={!planner.editor.canUndo}
        onClick={planner.editor.undo}
      />
      <KkPlanStatusStrip.Action
        id="redo"
        label={REDO_LABEL}
        icon="redo"
        disabled={!planner.editor.canRedo}
        onClick={planner.editor.redo}
      />
      <KkPlanStatusStrip.Count value={String(planner.counts.tables)} label={TABLES_COUNT_LABEL} />
      <KkPlanStatusStrip.Count value={String(planner.counts.chairs)} label={CHAIRS_COUNT_LABEL} />
      <KkPlanStatusStrip.Chip
        label={toFindingsChipLabel(planner.tally.conflicts, planner.tally.hints)}
        tone={findingsToneOf(planner.tally)}
        icon="alert"
        onClick={openFindings}
      />
      <KkPlanStatusStrip.Chip
        label={PLAN_FACTS_LABEL}
        icon="settings"
        onClick={planner.inspectPlan}
      />
    </KkPlanStatusStrip>
  );
};
