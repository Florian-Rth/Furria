import type { FC } from 'react';
import type { ConfirmationNextStep } from '@/features/membership/confirmation-content';
import { ConfirmOnwardActions } from './ConfirmOnwardActions';
import { ConfirmReapplyActions } from './ConfirmReapplyActions';

interface ConfirmNextStepProps {
  next: ConfirmationNextStep;
}

export const ConfirmNextStep: FC<ConfirmNextStepProps> = ({ next }) => {
  if (next === 'reapply') {
    return <ConfirmReapplyActions />;
  }

  return <ConfirmOnwardActions />;
};
