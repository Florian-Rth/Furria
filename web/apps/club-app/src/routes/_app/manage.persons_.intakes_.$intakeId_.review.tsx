import { createFileRoute } from '@tanstack/react-router';
import { IntakeReviewScreen } from '@/features/manage-intakes/components/IntakeReviewScreen';

export const Route = createFileRoute('/_app/manage/persons_/intakes_/$intakeId_/review')({
  component: IntakeReviewScreen,
});
