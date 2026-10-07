import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { PROFILE_ORIGIN, usePersonalMe } from '@/features/session';
import { CONTACT_DETAILS_EDIT_TITLE } from '../profile-labels';
import { toProfileErrorMessage } from '../profile-messages';
import { ProfileContactEditor } from './ProfileContactEditor';
import { ProfileContactEditSkeleton } from './ProfileContactEditSkeleton';
import { ProfileError } from './ProfileError';

export const ProfileContactEditScreen: FC = () => {
  const me = usePersonalMe();
  const errorMessage = toProfileErrorMessage(me.error);

  if (me.data !== undefined) {
    return <ProfileContactEditor person={me.data.person} />;
  }

  const content =
    errorMessage === null ? (
      <ProfileContactEditSkeleton />
    ) : (
      <ProfileError message={errorMessage} onRetry={me.refetch} />
    );

  return (
    <KkScreen kind="fullscreen" title={CONTACT_DETAILS_EDIT_TITLE} origin={PROFILE_ORIGIN}>
      {content}
    </KkScreen>
  );
};
