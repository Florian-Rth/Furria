import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { useApplyForm } from '@/features/membership/hooks/use-apply-form';
import { ApplyBody } from './ApplyBody';

export const ApplyPage: FC = () => {
  const state = useApplyForm();

  return (
    <PageLayout>
      <PageLayout.Body>
        <ApplyBody state={state} />
      </PageLayout.Body>
    </PageLayout>
  );
};
