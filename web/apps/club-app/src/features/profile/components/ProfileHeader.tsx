import { KkAvatar, KkChip, KkEyebrow, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { PROFILE_EYEBROW, toProfileHeadline } from '../profile-labels';

interface ProfileHeaderProps {
  me: Me | undefined;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ me }) => {
  const headline = toProfileHeadline(me);

  const stateRow =
    headline.state === null ? null : (
      <KkScreenHeader.Meta>
        <KkChip tone={headline.state.tone} dot={headline.state.dot}>
          {headline.state.label}
        </KkChip>
      </KkScreenHeader.Meta>
    );

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkAvatar initials={headline.initials} size="large" />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent" size="small">
          {PROFILE_EYEBROW}
        </KkEyebrow>
        <KkScreenHeader.Title transform="none">{headline.title}</KkScreenHeader.Title>
        {stateRow}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
