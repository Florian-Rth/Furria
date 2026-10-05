import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { useConfirmation } from '@/features/membership/hooks/use-confirmation';
import { ConfirmBody } from './ConfirmBody';

export const ConfirmPage: FC = () => {
  const state = useConfirmation();

  return (
    <PageLayout>
      <PageLayout.Body>
        <ConfirmBody state={state} />
      </PageLayout.Body>
    </PageLayout>
  );
};
