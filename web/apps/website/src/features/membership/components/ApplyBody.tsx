import type { FC } from 'react';
import type { ApplyFormState } from '@/features/membership/hooks/use-apply-form';
import { ApplyConfirmation } from './ApplyConfirmation';
import { ApplyFormSection } from './ApplyFormSection';

interface ApplyBodyProps {
  state: ApplyFormState;
}

export const ApplyBody: FC<ApplyBodyProps> = ({ state }) => {
  if (state.submittedFirstName !== null) {
    return <ApplyConfirmation firstName={state.submittedFirstName} />;
  }

  return <ApplyFormSection state={state} />;
};
