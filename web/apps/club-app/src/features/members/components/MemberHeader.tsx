import { KkAvatar, KkChip, KkEyebrow, KkPageHeader } from '@furria/ui';
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

  const stateChip =
    headline.state === null ? null : (
      <KkChip tone={headline.state.tone} dot={headline.state.dot}>
        {headline.state.label}
      </KkChip>
    );

  return (
    <KkPageHeader
      title={headline.title}
      titleTransform="none"
      eyebrow={
        <KkEyebrow tone="accent" size="small">
          {eyebrow}
        </KkEyebrow>
      }
      avatar={<KkAvatar initials={headline.initials} size="large" />}
      chip={stateChip}
    />
  );
};
