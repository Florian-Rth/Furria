import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActTrainingPage } from '@/features/acts/components/ActTrainingPage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const ActTrainingRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <ActTrainingPage actId={actId} trainingId={null} search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/training')({
  validateSearch: ActScreenSearchSchema,
  component: ActTrainingRoute,
});
