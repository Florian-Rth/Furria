import { createFileRoute } from '@tanstack/react-router';
import { IntakePage } from '@/features/manage-intakes/components/IntakePage';

export const Route = createFileRoute('/_app/manage/persons_/intakes_/$intakeId')({
  component: IntakePage,
});
