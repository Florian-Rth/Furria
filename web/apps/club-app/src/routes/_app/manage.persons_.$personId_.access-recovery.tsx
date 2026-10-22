import { createFileRoute } from '@tanstack/react-router';
import { PersonAccessRecoveryScreen } from '@/features/manage-persons/components/PersonAccessRecoveryScreen';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/access-recovery')({
  component: PersonAccessRecoveryScreen,
});
