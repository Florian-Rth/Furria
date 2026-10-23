import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { usePlanner } from '../planner-context';
import { LOAD_FAILED, LOADING_LABEL, RETRY_LABEL } from '../planner-copy';
import { PlannerCatalogue } from './PlannerCatalogue';
import { PlannerEvening } from './PlannerEvening';
import { PlannerModeTool } from './PlannerModeTool';
import { PlannerPane } from './PlannerPane';
import { PlannerProposalHolds } from './PlannerProposalHolds';
import { PlannerProposalShifts } from './PlannerProposalShifts';

export const PlannerBody: FC = () => {
  const planner = usePlanner();

  if (planner.store.isLoading) {
    return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
  }
  if (planner.store.loadError !== null) {
    return (
      <KkRetryAlert
        message={LOAD_FAILED}
        retrying={false}
        onRetry={planner.store.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  const picking = planner.mode === 'pick';
  const withPane = planner.isWide && !picking;
  const pane = withPane ? <PlannerPane /> : null;
  const shifts = planner.suggestion.isActive ? <PlannerProposalShifts /> : null;
  const holds = withPane ? null : <PlannerProposalHolds />;
  const list = picking ? <PlannerCatalogue /> : <PlannerEvening />;

  return (
    <KkPaneLayout>
      <KkPaneLayout.Main withPane={withPane}>
        <PlannerModeTool />
        {shifts}
        {holds}
        {list}
      </KkPaneLayout.Main>
      {pane}
    </KkPaneLayout>
  );
};
