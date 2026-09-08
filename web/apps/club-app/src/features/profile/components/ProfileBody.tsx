import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { toProfileErrorMessage } from '../profile-messages';
import { ProfileError } from './ProfileError';
import { ProfilePanels } from './ProfilePanels';
import { ProfileSkeleton } from './ProfileSkeleton';

export const ProfileBody: FC = () => {
  const me = useMeQuery();
  const errorMessage = toProfileErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (me.data !== undefined) {
    return <ProfilePanels me={me.data} />;
  }
  if (errorMessage !== null) {
    return <ProfileError message={errorMessage} onRetry={reload} />;
  }

  return <ProfileSkeleton />;
};
