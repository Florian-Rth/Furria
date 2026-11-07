import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StepSetupPage } from '@/features/act-studio/components/StepSetupPage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const StepSetupRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <StepSetupPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/steps/setup')({
  validateSearch: ActScreenSearchSchema,
  component: StepSetupRoute,
});
