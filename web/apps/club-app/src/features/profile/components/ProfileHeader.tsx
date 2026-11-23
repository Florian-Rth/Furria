import { KkChip } from '@furria/ui/KkChip';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { PortraitAvatar } from '@/features/portrait-view/components/PortraitAvatar';
import type { PersonalMe } from '@/lib/api/schemas';
import { toAvatarHonours } from '@/lib/honours';
import { PROFILE_EYEBROW, toProfileHeadline } from '../profile-labels';

interface ProfileHeaderProps {
  me: PersonalMe | undefined;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ me }) => {
  const headline = toProfileHeadline(me);
  const honours = me === undefined ? undefined : toAvatarHonours(me.honours);

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
        <PortraitAvatar
          name={headline.title}
          initials={headline.initials}
          picture={me?.person.portrait?.picture ?? null}
          size="header"
          honours={honours}
          arrival
        />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{PROFILE_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title>{headline.title}</KkScreenHeader.Title>
        {stateRow}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
