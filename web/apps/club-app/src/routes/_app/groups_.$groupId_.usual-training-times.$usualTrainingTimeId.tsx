import { createFileRoute } from '@tanstack/react-router';
import { UsualTrainingTimeScreen } from '@/features/group-hub/components/UsualTrainingTimeScreen';

export const Route = createFileRoute(
  '/_app/groups_/$groupId_/usual-training-times/$usualTrainingTimeId',
)({
  component: UsualTrainingTimeScreen,
});
