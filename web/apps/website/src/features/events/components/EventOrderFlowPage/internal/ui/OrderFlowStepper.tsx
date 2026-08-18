import { kkTokens } from '@furria/ui';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import type { FC } from 'react';
import { orderFlowStepLabels } from '@/features/events/order-flow-content';
import type { OrderFlowStep } from '@/features/events/order-flow-steps';
import { ORDER_FLOW_STEPS } from '@/features/events/order-flow-steps';

interface OrderFlowStepperProps {
  step: OrderFlowStep;
}

export const OrderFlowStepper: FC<OrderFlowStepperProps> = ({ step }) => {
  const activeStepIndex = step - 1;

  return (
    <Stepper
      activeStep={activeStepIndex}
      sx={(theme) => ({
        width: '100%',
        '& .MuiStepLabel-label': { ...theme.typography.overline, ...kkTokens.eyebrow },
        '& .MuiStepIcon-root': { color: 'text.secondary' },
        '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': {
          color: 'primary.main',
        },
        '& .MuiStepIcon-text': { fill: (theme.vars ?? theme).palette.background.paper },
      })}
    >
      {ORDER_FLOW_STEPS.map((flowStep) => (
        <Step key={flowStep}>
          <StepLabel>{orderFlowStepLabels[flowStep]}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
