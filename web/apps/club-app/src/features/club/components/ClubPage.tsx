import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_SECTION } from '@/features/session';
import { ClubLinks } from './ClubLinks';

const CLUB_TITLE = 'Verein';
const CLUB_LEAD =
  'Wer zum FCC gehört und in welchen Gruppen getanzt, gespielt und organisiert wird.';

export const ClubPage: FC = () => {
  return (
    <KkScreen
      kind="overview"
      section={CLUB_SECTION}
      title={CLUB_TITLE}
      header={<KkTitleHeader title={CLUB_TITLE} lead={CLUB_LEAD} />}
    >
      <ClubLinks />
    </KkScreen>
  );
};
