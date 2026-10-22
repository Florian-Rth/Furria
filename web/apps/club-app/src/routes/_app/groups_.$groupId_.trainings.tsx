import { createFileRoute } from '@tanstack/react-router';
import { TrainingGeneratorScreen } from '@/features/group-hub/components/TrainingGeneratorScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/trainings')({
  component: TrainingGeneratorScreen,
});
