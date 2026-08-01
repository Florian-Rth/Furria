import { KkEyebrow } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { matcherResultLabels } from '@/features/group-matcher/matcher-content';
import { MatcherMatchHead } from '../layout/MatcherMatchHead';
import { MatcherMatchTitleRow } from '../layout/MatcherMatchTitleRow';
import { MatcherTopMatchCard } from '../layout/MatcherTopMatchCard';
import type { MatcherMatchView } from '../logic/matcher-result';
import { MatcherMatchBar } from './MatcherMatchBar';
import { MatcherRecruitingChip } from './MatcherRecruitingChip';
import { MatcherWhyPanel } from './MatcherWhyPanel';

interface MatcherTopMatchProps {
  match: MatcherMatchView;
}

export const MatcherTopMatch: FC<MatcherTopMatchProps> = ({ match }) => (
  <MatcherTopMatchCard>
    <MatcherMatchHead>
      <KkEyebrow>{matcherResultLabels.topKicker}</KkEyebrow>
      <MatcherMatchTitleRow>
        <Typography variant="h4" component="p">
          {match.group.name}
        </Typography>
        <MatcherRecruitingChip badge={match.badge} />
      </MatcherMatchTitleRow>
      <MatcherMatchBar percentage={match.percentage} groupName={match.group.name} />
    </MatcherMatchHead>
    <MatcherWhyPanel match={match} />
  </MatcherTopMatchCard>
);
