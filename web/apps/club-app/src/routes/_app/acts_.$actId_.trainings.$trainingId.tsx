import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActTrainingPage } from '@/features/acts/components/ActTrainingPage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const ActHallTrainingRoute: FC = () => {
  const { actId, trainingId } = Route.useParams();
  const search = Route.useSearch();

  return <ActTrainingPage actId={actId} trainingId={trainingId} search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/trainings/$trainingId')({
  validateSearch: ActScreenSearchSchema,
  component: ActHallTrainingRoute,
});
