import { KkAvatar, KkChip, KkEyebrow, KkPageHeader } from '@furria/ui';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { PROFILE_EYEBROW, toProfileHeadline } from '../profile-labels';

interface ProfileHeaderProps {
  me: Me | undefined;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ me }) => {
  const headline = toProfileHeadline(me);

  const stateChip =
    headline.state === null ? null : (
      <KkChip tone={headline.state.tone} dot={headline.state.dot}>
        {headline.state.label}
      </KkChip>
    );

  return (
    <KkPageHeader
      title={headline.title}
      eyebrow={
        <KkEyebrow tone="accent" size="small">
          {PROFILE_EYEBROW}
        </KkEyebrow>
      }
      avatar={<KkAvatar initials={headline.initials} size="large" />}
      chip={stateChip}
    />
  );
};
