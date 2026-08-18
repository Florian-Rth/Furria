import { useCanGoBack, useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import type { OrderFlowStep } from '@/features/events/order-flow-steps';
import {
  buildOrderFlowStepParam,
  derivePreviousOrderFlowStep,
  resolveOrderFlowStep,
} from '@/features/events/order-flow-steps';

export interface OrderFlowStepState {
  step: OrderFlowStep;
  goToStep: (step: OrderFlowStep) => void;
  goToPreviousStep: () => void;
}

export const useOrderFlowStep = (): OrderFlowStepState => {
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { step: stepParam } = useSearch({ strict: false });
  const step = resolveOrderFlowStep(stepParam);

  const navigateToStep = (nextStep: OrderFlowStep, replace: boolean): void => {
    void navigate({ to: '.', search: { step: buildOrderFlowStepParam(nextStep) }, replace });
  };

  return {
    step,
    goToStep: (nextStep: OrderFlowStep): void => navigateToStep(nextStep, false),
    goToPreviousStep: (): void => {
      if (canGoBack) {
        router.history.back();
        return;
      }
      const previousStep = derivePreviousOrderFlowStep(step);
      if (previousStep === null) {
        return;
      }
      navigateToStep(previousStep, true);
    },
  };
};
