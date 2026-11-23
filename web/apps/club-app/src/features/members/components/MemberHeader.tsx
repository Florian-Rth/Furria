import { KkChip } from '@furria/ui/KkChip';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { PortraitAvatar } from '@/features/portrait-view/components/PortraitAvatar';
import { toAvatarHonours } from '@/lib/honours';
import { toMemberHeadline } from '../members-labels';
import type { MemberDetails } from '../schemas';

const EYEBROW = 'Person';
const SELF_EYEBROW = 'Deine Karte';

interface MemberHeaderProps {
  member: MemberDetails | undefined;
  isSelf: boolean;
}

export const MemberHeader: FC<MemberHeaderProps> = ({ member, isSelf }) => {
  const headline = toMemberHeadline(member);
  const eyebrow = isSelf ? SELF_EYEBROW : EYEBROW;
  const honours = member === undefined ? undefined : toAvatarHonours(member.honours);

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
          picture={member?.portrait ?? null}
          size="header"
          honours={honours}
        />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{eyebrow}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{headline.title}</KkScreenHeader.Title>
        {stateRow}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
