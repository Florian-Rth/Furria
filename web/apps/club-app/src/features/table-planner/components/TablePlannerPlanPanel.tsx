import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import type { Seating } from '@/features/hall-plan/schemas';
import { useTablePlannerContext } from '../table-planner-context';
import { PLAN_PANEL_NOTE, PLAN_PANEL_TITLE, toPlanMeta } from '../table-planner-copy';
import { TablePlannerPlanSeating } from './TablePlannerPlanSeating';
import { TablePlannerPlanTools } from './TablePlannerPlanTools';

export const TablePlannerPlanPanel: FC = () => {
  const planner = useTablePlannerContext();
  const meta = toPlanMeta(planner.plan.hall.name, planner.counts.tables, planner.counts.chairs);
  const change = (seating: Seating): void => {
    planner.commands.setPlanSeating(seating);
  };
  const tools = planner.isTouch ? <TablePlannerPlanTools /> : null;

  return (
    <KkFormSection title={PLAN_PANEL_TITLE}>
      <KkMeta tone="muted">{meta}</KkMeta>
      <TablePlannerPlanSeating seating={planner.editor.document.seating} onChange={change} />
      {tools}
      <KkMeta tone="muted">{PLAN_PANEL_NOTE}</KkMeta>
    </KkFormSection>
  );
};
