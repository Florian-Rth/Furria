import { KkCheckLine } from '@furria/ui/KkCheckLine';
import { KkNote } from '@furria/ui/KkNote';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useRunningOrderStep } from '../hooks/use-running-order-step';
import {
  NO_ORDER_LABEL,
  NO_ORDER_VALUE,
  NO_PLANNER_NOTE,
  RUNNING_ORDER_LOADING_LABEL,
  RUNNING_ORDER_RETRY_LABEL,
} from '../running-order-step-copy';
import type { EventDetails } from '../schemas';
import { EventRunningOrderChecks } from './EventRunningOrderChecks';

const SKELETON_ROWS = 3;

interface EventPaneRunningOrderProps {
  event: EventDetails;
}

export const EventPaneRunningOrder: FC<EventPaneRunningOrderProps> = ({ event }) => {
  const { step } = useRunningOrderStep(event.eventId, true);

  switch (step.kind) {
    case 'denied':
      return <KkNote>{NO_PLANNER_NOTE}</KkNote>;
    case 'loading':
      return (
        <Stack role="status" aria-label={RUNNING_ORDER_LOADING_LABEL}>
          <KkSkeletonRow count={SKELETON_ROWS} />
        </Stack>
      );
    case 'failed':
      return (
        <KkRetryAlert
          message={step.message}
          retrying={step.retrying}
          onRetry={step.retry}
          retryLabel={RUNNING_ORDER_RETRY_LABEL}
        />
      );
    case 'none':
      return (
        <KkCheckLine label={NO_ORDER_LABEL} value={NO_ORDER_VALUE} state="off" icon="timeline" />
      );
    case 'planned':
      return <EventRunningOrderChecks checks={step.checks} />;
  }
};
