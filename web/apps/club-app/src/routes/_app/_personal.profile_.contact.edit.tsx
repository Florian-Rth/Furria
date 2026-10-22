import { createFileRoute } from '@tanstack/react-router';
import { ProfileContactEditScreen } from '@/features/profile/components/ProfileContactEditScreen';

export const Route = createFileRoute('/_app/_personal/profile_/contact/edit')({
  component: ProfileContactEditScreen,
});
