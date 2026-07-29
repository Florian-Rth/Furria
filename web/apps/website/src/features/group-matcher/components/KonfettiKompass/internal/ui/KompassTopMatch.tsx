import { KkEyebrow } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kompassResultLabels } from '@/features/group-matcher/kompass-content';
import { KompassMatchHead } from '../layout/KompassMatchHead';
import { KompassMatchTitleRow } from '../layout/KompassMatchTitleRow';
import { KompassTopMatchCard } from '../layout/KompassTopMatchCard';
import type { KompassMatchView } from '../logic/kompass-result';
import { KompassMatchBar } from './KompassMatchBar';
import { KompassRecruitingChip } from './KompassRecruitingChip';
import { KompassWhyPanel } from './KompassWhyPanel';

interface KompassTopMatchProps {
  match: KompassMatchView;
}

export const KompassTopMatch: FC<KompassTopMatchProps> = ({ match }) => (
  <KompassTopMatchCard>
    <KompassMatchHead>
      <KkEyebrow>{kompassResultLabels.topKicker}</KkEyebrow>
      <KompassMatchTitleRow>
        <Typography variant="h4" component="p">
          {match.group.name}
        </Typography>
        <KompassRecruitingChip badge={match.badge} />
      </KompassMatchTitleRow>
      <KompassMatchBar percentage={match.percentage} groupName={match.group.name} />
    </KompassMatchHead>
    <KompassWhyPanel match={match} />
  </KompassTopMatchCard>
);
