import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildRankLabel } from '@/features/group-matcher/matcher-content';
import { MatcherMatchCard } from '../layout/MatcherMatchCard';
import { MatcherMatchHead } from '../layout/MatcherMatchHead';
import { MatcherMatchTitleRow } from '../layout/MatcherMatchTitleRow';
import type { MatcherMatchView } from '../logic/matcher-result';
import { MatcherMatchBar } from './MatcherMatchBar';
import { MatcherRecruitingChip } from './MatcherRecruitingChip';
import { MatcherWhyPanel } from './MatcherWhyPanel';

interface MatcherRankRowProps {
  match: MatcherMatchView;
}

export const MatcherRankRow: FC<MatcherRankRowProps> = ({ match }) => {
  const rankLabel = buildRankLabel(match.rank);

  return (
    <MatcherMatchCard>
      <MatcherMatchHead>
        <MatcherMatchTitleRow>
          <Typography variant="h3" component="span" sx={{ color: 'text.secondary' }}>
            {rankLabel}
          </Typography>
          <Typography variant="h3" component="p">
            {match.group.name}
          </Typography>
          <MatcherRecruitingChip badge={match.badge} />
        </MatcherMatchTitleRow>
        <MatcherMatchBar percentage={match.percentage} groupName={match.group.name} />
      </MatcherMatchHead>
      <MatcherWhyPanel match={match} />
    </MatcherMatchCard>
  );
};
