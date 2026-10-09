import { createFileRoute } from '@tanstack/react-router';
import { ProfilePortraitScreen } from '@/features/profile';

export const Route = createFileRoute('/_app/_personal/profile_/portrait')({
  component: ProfilePortraitScreen,
});
