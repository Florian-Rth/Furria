import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { useApplyForm } from '@/features/membership/hooks/use-apply-form';
import { ApplyBody } from './ApplyBody';

interface ApplyPageProps {
  prefilledGroupInterests: string[];
}

export const ApplyPage: FC<ApplyPageProps> = ({ prefilledGroupInterests }) => {
  const state = useApplyForm(prefilledGroupInterests);

  return (
    <PageLayout>
      <PageLayout.Body>
        <ApplyBody state={state} />
      </PageLayout.Body>
    </PageLayout>
  );
};
