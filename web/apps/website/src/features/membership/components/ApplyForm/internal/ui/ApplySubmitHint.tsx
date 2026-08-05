import { KkNote } from '@furria/ui';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { applySubmitDisabledHint } from '@/features/membership/apply-content';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

export const ApplySubmitHint: FC = () => {
  const { formState } = useFormContext<MembershipApplicationForm>();

  if (formState.isValid) {
    return null;
  }

  return <KkNote>{applySubmitDisabledHint}</KkNote>;
};
