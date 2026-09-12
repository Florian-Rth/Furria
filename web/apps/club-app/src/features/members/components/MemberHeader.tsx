import { KkAvatar, KkChip, KkEyebrow, KkPageHeader } from '@furria/ui';
import type { FC } from 'react';
import { toMemberHeadline } from '../members-labels';
import type { MemberDetails } from '../schemas';

const EYEBROW = 'Person';

interface MemberHeaderProps {
  member: MemberDetails | undefined;
}

export const MemberHeader: FC<MemberHeaderProps> = ({ member }) => {
  const headline = toMemberHeadline(member);

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
          {EYEBROW}
        </KkEyebrow>
      }
      avatar={<KkAvatar initials={headline.initials} size="large" />}
      chip={stateChip}
    />
  );
};
