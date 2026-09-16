import { KkAvatar, KkChip, KkEyebrow, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
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
          {eyebrow}
        </KkEyebrow>
        <KkScreenHeader.Title transform="none">{headline.title}</KkScreenHeader.Title>
        {stateRow}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
