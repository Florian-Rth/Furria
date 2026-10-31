import { createFileRoute } from '@tanstack/react-router';
import { UsualTrainingTimeNewScreen } from '@/features/group-hub/components/UsualTrainingTimeNewScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/usual-training-times/new')({
  component: UsualTrainingTimeNewScreen,
});
