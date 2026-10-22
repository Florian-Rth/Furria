import { KkScreen } from '@furria/ui/KkScreen';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_ORIGIN } from '@/features/session/app-sections';
import { usePersonalMe } from '@/features/session/hooks/use-personal-me';
import { toProfileHeadline } from '../profile-labels';
import { ProfileBody } from './ProfileBody';
import { ProfileHeader } from './ProfileHeader';

export const ProfilePage: FC = () => {
  const me = usePersonalMe();
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
