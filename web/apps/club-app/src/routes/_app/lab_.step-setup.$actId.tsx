import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StepSetupLabPage } from '@/features/lab-step-setup/components/StepSetupLabPage';

const StepSetupLabRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StepSetupLabPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/step-setup/$actId')({
  component: StepSetupLabRoute,
});
