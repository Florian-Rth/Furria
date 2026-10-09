import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { PictureEditor } from '@/features/pictures';
import { PROFILE_ORIGIN, usePersonalMe } from '@/features/session';
import { toInitials } from '@/lib/initials';
import { PORTRAIT_TITLE } from '../profile-labels';
import { toProfileErrorMessage } from '../profile-messages';
import { ProfileContactEditSkeleton } from './ProfileContactEditSkeleton';
import { ProfileError } from './ProfileError';

export const ProfilePortraitScreen: FC = () => {
  const me = usePersonalMe();
  const errorMessage = toProfileErrorMessage(me.error);

  if (me.data !== undefined) {
    const { person } = me.data;
    const target = { kind: 'portrait', ownerId: person.id } as const;
    const name = `${person.firstName} ${person.lastName}`;
    const initials = toInitials(person.firstName, person.lastName);

    return (
      <PictureEditor
        target={target}
        editing={person.portrait}
        origin={PROFILE_ORIGIN}
        alt={name}
        placeholderLabel={initials}
        refresh={me.refetch}
      />
    );
  }

  const content =
    errorMessage === null ? (
      <ProfileContactEditSkeleton />
    ) : (
      <ProfileError message={errorMessage} onRetry={me.refetch} />
    );

  return (
    <KkScreen kind="fullscreen" title={PORTRAIT_TITLE} origin={PROFILE_ORIGIN}>
      {content}
    </KkScreen>
  );
};
