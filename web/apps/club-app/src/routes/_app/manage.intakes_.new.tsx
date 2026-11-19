import { createFileRoute } from '@tanstack/react-router';
import { IntakeNewScreen } from '@/features/manage-intakes/components/IntakeNewScreen';
import { IntakeNewSearchSchema } from '@/features/manage-intakes/schemas';

export const Route = createFileRoute('/_app/manage/intakes_/new')({
  component: IntakeNewScreen,
  validateSearch: IntakeNewSearchSchema,
});
