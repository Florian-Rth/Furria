import { createFileRoute } from '@tanstack/react-router';
import { TrainingGeneratorScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/trainings')({
  component: TrainingGeneratorScreen,
});
