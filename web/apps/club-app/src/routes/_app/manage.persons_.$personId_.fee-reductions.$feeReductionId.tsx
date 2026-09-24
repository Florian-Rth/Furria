import { createFileRoute } from '@tanstack/react-router';
import { PersonFeeReductionScreen } from '@/features/manage-persons';

export const Route = createFileRoute(
  '/_app/manage/persons_/$personId_/fee-reductions/$feeReductionId',
)({
  component: PersonFeeReductionScreen,
});
