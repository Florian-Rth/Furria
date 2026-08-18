import { KkSection, PageLayout } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  STICKY_ACTION_BAR_STACKED_HEIGHT,
  StickyActionBar,
} from '@/features/events/components/StickyActionBar';
import { ticketPanelKicker } from '@/features/events/event-detail-content';
import {
  orderFlowStepLabels,
  orderFlowStepPlaceholders,
} from '@/features/events/order-flow-content';
import { deriveOrderFlowAction, deriveOrderFlowNotice } from '@/features/events/order-flow-display';
import { FIRST_ORDER_FLOW_STEP } from '@/features/events/order-flow-steps';
import type { Event } from '@/lib/seed/events';
import { OrderFlowBarActions } from './internal/layout/OrderFlowBarActions';
import { OrderFlowHeader } from './internal/layout/OrderFlowHeader';
import { OrderFlowPanelShell } from './internal/layout/OrderFlowPanelShell';
import { useOrderFlowStep } from './internal/logic/use-order-flow-step';
import { OrderFlowAvailability } from './internal/ui/OrderFlowAvailability';
import { OrderFlowBackAction } from './internal/ui/OrderFlowBackAction';
import { OrderFlowBackLink } from './internal/ui/OrderFlowBackLink';
import { OrderFlowHeadline } from './internal/ui/OrderFlowHeadline';
import { OrderFlowKicker } from './internal/ui/OrderFlowKicker';
import { OrderFlowPlaceholderPanel } from './internal/ui/OrderFlowPlaceholderPanel';
import { OrderFlowPrimaryAction } from './internal/ui/OrderFlowPrimaryAction';
import { OrderFlowStateNotice } from './internal/ui/OrderFlowStateNotice';
import { OrderFlowStepper } from './internal/ui/OrderFlowStepper';
import { OrderFlowStepSummary } from './internal/ui/OrderFlowStepSummary';

interface EventOrderFlowPageProps {
  event: Event;
}

export const EventOrderFlowPage: FC<EventOrderFlowPageProps> = ({ event }) => {
  const { step, goToStep, goToPreviousStep } = useOrderFlowStep();
  const notice = deriveOrderFlowNotice(event);
  const placeholder = orderFlowStepPlaceholders[step];
  const action = deriveOrderFlowAction(step);
  const backAction =
    step === FIRST_ORDER_FLOW_STEP ? null : <OrderFlowBackAction onBack={goToPreviousStep} />;

  const kickerLead = notice === null ? orderFlowStepLabels[step] : ticketPanelKicker;
  const availability = notice === null ? <OrderFlowAvailability event={event} /> : null;
  const stepper = notice === null ? <OrderFlowStepper step={step} /> : null;

  const body =
    notice === null ? (
      <OrderFlowPanelShell>
        <OrderFlowPlaceholderPanel placeholder={placeholder} />
      </OrderFlowPanelShell>
    ) : (
      <OrderFlowStateNotice notice={notice} />
    );

  const bottomBar =
    notice === null ? (
      <>
        <Box aria-hidden sx={{ height: STICKY_ACTION_BAR_STACKED_HEIGHT }} />
        <StickyActionBar
          sx={{
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            minHeight: STICKY_ACTION_BAR_STACKED_HEIGHT,
          }}
        >
          <OrderFlowStepSummary event={event} step={step} />
          <OrderFlowBarActions>
            {backAction}
            <OrderFlowPrimaryAction action={action} onAdvance={goToStep} />
          </OrderFlowBarActions>
        </StickyActionBar>
      </>
    ) : null;

  return (
    <PageLayout>
      <PageLayout.Body>
        <KkSection>
          <OrderFlowHeader>
            <OrderFlowBackLink event={event} />
            <OrderFlowKicker event={event} lead={kickerLead} />
            <OrderFlowHeadline event={event} />
            {availability}
            {stepper}
          </OrderFlowHeader>
          {body}
        </KkSection>
      </PageLayout.Body>
      {bottomBar}
    </PageLayout>
  );
};
