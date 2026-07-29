import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildRankLabel } from '@/features/group-matcher/kompass-content';
import { KompassMatchCard } from '../layout/KompassMatchCard';
import { KompassMatchHead } from '../layout/KompassMatchHead';
import { KompassMatchTitleRow } from '../layout/KompassMatchTitleRow';
import type { KompassMatchView } from '../logic/kompass-result';
import { KompassMatchBar } from './KompassMatchBar';
import { KompassRecruitingChip } from './KompassRecruitingChip';
import { KompassWhyPanel } from './KompassWhyPanel';

interface KompassRankRowProps {
  match: KompassMatchView;
}

export const KompassRankRow: FC<KompassRankRowProps> = ({ match }) => {
  const rankLabel = buildRankLabel(match.rank);

  return (
    <KompassMatchCard>
      <KompassMatchHead>
        <KompassMatchTitleRow>
          <Typography variant="h5" component="span" sx={{ color: 'text.secondary' }}>
            {rankLabel}
          </Typography>
          <Typography variant="h5" component="p">
            {match.group.name}
          </Typography>
          <KompassRecruitingChip badge={match.badge} />
        </KompassMatchTitleRow>
        <KompassMatchBar percentage={match.percentage} groupName={match.group.name} />
      </KompassMatchHead>
      <KompassWhyPanel match={match} />
    </KompassMatchCard>
  );
};
