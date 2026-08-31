import { KkSection, PageLayout } from '@furria/ui';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';
import {
  STICKY_ACTION_BAR_STACKED_HEIGHT,
  StickyActionBar,
} from '@/features/events/components/StickyActionBar';
import { deriveOrderFlowAction, deriveOrderFlowNotice } from '@/features/events/order-flow-display';
import type { OrderFlowStep } from '@/features/events/order-flow-steps';
import {
  BUYER_ORDER_FLOW_STEP,
  FIRST_ORDER_FLOW_STEP,
  PAYMENT_ORDER_FLOW_STEP,
} from '@/features/events/order-flow-steps';
import type { Event } from '@/lib/seed/events';
import { OrderFlowBarActions } from './internal/layout/OrderFlowBarActions';
import { OrderFlowHeader } from './internal/layout/OrderFlowHeader';
import { useOrderBuyerForm } from './internal/logic/use-order-buyer-form';
import { useOrderFlowStep } from './internal/logic/use-order-flow-step';
import { OrderFlowAvailability } from './internal/ui/OrderFlowAvailability';
import { OrderFlowBackAction } from './internal/ui/OrderFlowBackAction';
import { OrderFlowBackLink } from './internal/ui/OrderFlowBackLink';
import { OrderFlowBuyerStep } from './internal/ui/OrderFlowBuyerStep';
import { OrderFlowHeadline } from './internal/ui/OrderFlowHeadline';
import { OrderFlowPaymentStep } from './internal/ui/OrderFlowPaymentStep';
import { OrderFlowPrimaryAction } from './internal/ui/OrderFlowPrimaryAction';
import { OrderFlowSelectionStep } from './internal/ui/OrderFlowSelectionStep';
import { OrderFlowStateNotice } from './internal/ui/OrderFlowStateNotice';
import { OrderFlowStepper } from './internal/ui/OrderFlowStepper';
import { OrderFlowStepSummary } from './internal/ui/OrderFlowStepSummary';

interface EventOrderFlowPageProps {
  event: Event;
}

const fillsViewportBelowMasthead: SxProps<Theme> = {
  minHeight: `calc(100dvh - var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px))`,
};

export const EventOrderFlowPage: FC<EventOrderFlowPageProps> = ({ event }) => {
  const { step, goToStep, goToPreviousStep } = useOrderFlowStep();
  const buyerForm = useOrderBuyerForm(() => {
    goToStep(PAYMENT_ORDER_FLOW_STEP);
  });
  const notice = deriveOrderFlowNotice(event);
  const action = deriveOrderFlowAction(step, buyerForm.buyer !== null);
  const backAction =
    step === FIRST_ORDER_FLOW_STEP ? null : <OrderFlowBackAction onBack={goToPreviousStep} />;

  const availability = notice === null ? <OrderFlowAvailability event={event} /> : null;
  const stepper = notice === null ? <OrderFlowStepper step={step} /> : null;

  const stepBodies: Record<OrderFlowStep, ReactNode> = {
    [FIRST_ORDER_FLOW_STEP]: <OrderFlowSelectionStep />,
    [BUYER_ORDER_FLOW_STEP]: (
      <OrderFlowBuyerStep form={buyerForm.form} onSubmit={buyerForm.submit} />
    ),
    [PAYMENT_ORDER_FLOW_STEP]: <OrderFlowPaymentStep event={event} buyer={buyerForm.buyer} />,
  };

  const body = notice === null ? stepBodies[step] : <OrderFlowStateNotice notice={notice} />;

  const bottomBar =
    notice === null ? (
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
          <OrderFlowPrimaryAction
            action={action}
            onAdvance={goToStep}
            onSubmit={buyerForm.submit}
          />
        </OrderFlowBarActions>
      </StickyActionBar>
    ) : null;

  return (
    <PageLayout sx={fillsViewportBelowMasthead}>
      <PageLayout.Body>
        <KkSection>
          <OrderFlowHeader>
            <OrderFlowBackLink event={event} />
            <OrderFlowHeadline />
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
