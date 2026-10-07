import type { FC } from 'react';
import { usePersonalMe } from '@/features/session';
import { toProfileErrorMessage } from '../profile-messages';
import { ProfileError } from './ProfileError';
import { ProfilePanels } from './ProfilePanels';
import { ProfileSkeleton } from './ProfileSkeleton';

export const ProfileBody: FC = () => {
  const me = usePersonalMe();
  const errorMessage = toProfileErrorMessage(me.error);

  if (me.data !== undefined) {
    return <ProfilePanels me={me.data} />;
  }
  if (errorMessage !== null) {
    return <ProfileError message={errorMessage} onRetry={me.refetch} />;
  }

  return <ProfileSkeleton />;
};
