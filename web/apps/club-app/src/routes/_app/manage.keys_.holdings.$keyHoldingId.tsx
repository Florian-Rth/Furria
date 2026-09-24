import { createFileRoute } from '@tanstack/react-router';
import { KeyHoldingScreen } from '@/features/manage-keys';

export const Route = createFileRoute('/_app/manage/keys_/holdings/$keyHoldingId')({
  component: KeyHoldingScreen,
});
