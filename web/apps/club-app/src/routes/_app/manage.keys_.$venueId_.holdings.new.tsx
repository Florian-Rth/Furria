import { createFileRoute } from '@tanstack/react-router';
import { KeyHoldingNewScreen } from '@/features/manage-keys/components/KeyHoldingNewScreen';

export const Route = createFileRoute('/_app/manage/keys_/$venueId_/holdings/new')({
  component: KeyHoldingNewScreen,
});
