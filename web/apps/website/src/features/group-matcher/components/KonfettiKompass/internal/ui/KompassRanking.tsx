import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kompassMailHref, kompassResultLabels } from '@/features/group-matcher/kompass-content';
import { KompassRankList } from '../layout/KompassRankList';
import { KompassResultActions } from '../layout/KompassResultActions';
import type { KompassRankingView } from '../logic/kompass-result';
import { KompassExcludedList } from './KompassExcludedList';
import { KompassRankRow } from './KompassRankRow';
import { KompassTopMatch } from './KompassTopMatch';

interface KompassRankingProps {
  view: KompassRankingView;
  summary: string;
}

export const KompassRanking: FC<KompassRankingProps> = ({ view, summary }) => (
  <>
    <Stack sx={{ gap: 1.5 }}>
      <Typography variant="h3" component="p">
        {kompassResultLabels.rankingTitle}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {summary}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {kompassResultLabels.rankingCaveat}
      </Typography>
    </Stack>
    <KompassRankList>
      <KompassTopMatch match={view.top} />
      {view.rest.map((match) => (
        <KompassRankRow key={match.group.id} match={match} />
      ))}
    </KompassRankList>
    <KompassExcludedList excluded={view.excluded} />
    <Stack sx={{ gap: 1.5 }}>
      <KompassResultActions>
        <Button href={view.applyHref} variant="contained" color="primary" size="large">
          {kompassResultLabels.applyCta}
        </Button>
        <Button href={kompassMailHref} variant="outlined" size="large">
          {kompassResultLabels.askCta}
        </Button>
      </KompassResultActions>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {view.handoffNote}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {kompassResultLabels.answersKeptHint}
      </Typography>
    </Stack>
  </>
);
