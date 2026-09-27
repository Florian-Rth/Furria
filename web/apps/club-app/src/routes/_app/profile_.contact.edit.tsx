import { createFileRoute } from '@tanstack/react-router';
import { ProfileContactEditScreen } from '@/features/profile';

export const Route = createFileRoute('/_app/profile_/contact/edit')({
  component: ProfileContactEditScreen,
});
