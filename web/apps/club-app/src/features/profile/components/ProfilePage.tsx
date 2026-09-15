import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { MORE_ORIGIN, useMeQuery } from '@/features/session';
import { toProfileHeadline } from '../profile-labels';
import { ProfileBody } from './ProfileBody';
import { ProfileHeader } from './ProfileHeader';

export const ProfilePage: FC = () => {
  const me = useMeQuery();
  const headline = toProfileHeadline(me.data);

  return (
    <KkScreen
      kind="detail"
      title={headline.title}
      origin={MORE_ORIGIN}
      header={<ProfileHeader me={me.data} />}
    >
      <ProfileBody />
    </KkScreen>
  );
};
