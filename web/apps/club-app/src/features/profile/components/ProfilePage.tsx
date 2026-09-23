import { KkScreen, KkScreenHeaderSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_ORIGIN, useMeQuery } from '@/features/session';
import { toProfileHeadline } from '../profile-labels';
import { ProfileBody } from './ProfileBody';
import { ProfileHeader } from './ProfileHeader';

export const ProfilePage: FC = () => {
  const me = useMeQuery();
  const headline = toProfileHeadline(me.data);

  const pendingHeader = me.error === null ? <KkScreenHeaderSkeleton /> : null;
  const header = me.data === undefined ? pendingHeader : <ProfileHeader me={me.data} />;

  return (
    <KkScreen
      kind="detail"
      title={headline.title}
      origin={MORE_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.profile}
    >
      <ProfileBody />
    </KkScreen>
  );
};
