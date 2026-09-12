import type { FC } from 'react';
import { AppPageHeader, useMeQuery } from '@/features/session';
import { ProfileBody } from './ProfileBody';
import { ProfileHeader } from './ProfileHeader';

export const ProfilePage: FC = () => {
  const me = useMeQuery();

  return (
    <>
      <AppPageHeader>
        <ProfileHeader me={me.data} />
      </AppPageHeader>
      <ProfileBody />
    </>
  );
};
