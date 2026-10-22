import { createFileRoute } from '@tanstack/react-router';
import { PersonFeeReductionNewScreen } from '@/features/manage-persons/components/PersonFeeReductionNewScreen';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/fee-reductions/new')({
  component: PersonFeeReductionNewScreen,
});
