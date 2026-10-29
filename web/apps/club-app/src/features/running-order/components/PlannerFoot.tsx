import { KkActionFoot } from '@furria/ui/KkActionFoot';
import type { FC } from 'react';
import type { PlannerFootView } from '../hooks/use-planner-action';
import { PlannerDeedButton } from './PlannerDeedButton';

interface PlannerFootProps {
  view: PlannerFootView;
}

export const PlannerFoot: FC<PlannerFootProps> = ({ view }) => (
  <KkActionFoot notice={view.notice}>
    <PlannerDeedButton deed={view.start} weight="outlined" size="medium" />
    <PlannerDeedButton deed={view.end} weight="contained" size="medium" />
  </KkActionFoot>
);
