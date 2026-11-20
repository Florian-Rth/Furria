import { createFileRoute } from '@tanstack/react-router';
import { IntakeEditScreen } from '@/features/manage-intakes/components/IntakeEditScreen';

export const Route = createFileRoute('/_app/manage/persons_/intakes_/$intakeId_/edit')({
  component: IntakeEditScreen,
});
