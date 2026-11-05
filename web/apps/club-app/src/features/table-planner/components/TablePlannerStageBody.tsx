import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import type { TablePlannerStage } from '../hooks/use-table-planner-screen';
import { LOAD_FAILED, LOADING_LABEL, RETRY_LABEL } from '../table-planner-copy';
import { TablePlannerEditor } from './TablePlannerEditor';
import { TablePlannerStart } from './TablePlannerStart';

interface TablePlannerStageBodyProps {
  stage: TablePlannerStage;
  eventId: number;
  onConflict: () => void;
}

export const TablePlannerStageBody: FC<TablePlannerStageBodyProps> = ({
  stage,
  eventId,
  onConflict,
}) => {
  switch (stage.kind) {
    case 'loading':
      return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
    case 'failed':
      return (
        <KkRetryAlert
          message={LOAD_FAILED}
          retrying={stage.retrying}
          onRetry={stage.retry}
          retryLabel={RETRY_LABEL}
        />
      );
    case 'start':
      return <TablePlannerStart eventId={eventId} event={stage.event} />;
    case 'editing':
      return (
        <TablePlannerEditor
          key={stage.edition}
          plan={stage.plan}
          seating={stage.seating}
          onConflict={onConflict}
        />
      );
  }
};
