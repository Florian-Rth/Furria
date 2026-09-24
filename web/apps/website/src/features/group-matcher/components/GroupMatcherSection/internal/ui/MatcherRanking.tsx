import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { matcherMailHref, matcherResultLabels } from '@/features/group-matcher/matcher-content';
import { MatcherRankList } from '../layout/MatcherRankList';
import { MatcherResultActions } from '../layout/MatcherResultActions';
import type { MatcherRankingView } from '../logic/matcher-result';
import { MatcherExcludedList } from './MatcherExcludedList';
import { MatcherRankRow } from './MatcherRankRow';
import { MatcherTopMatch } from './MatcherTopMatch';

interface MatcherRankingProps {
  view: MatcherRankingView;
  summary: string;
}

export const MatcherRanking: FC<MatcherRankingProps> = ({ view, summary }) => (
  <>
    <Stack sx={{ gap: 1.5 }}>
      <Typography variant="h2" component="p">
        {matcherResultLabels.rankingTitle}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {summary}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {matcherResultLabels.rankingCaveat}
      </Typography>
    </Stack>
    <MatcherRankList>
      <MatcherTopMatch match={view.top} />
      {view.rest.map((match) => (
        <MatcherRankRow key={match.group.id} match={match} />
      ))}
    </MatcherRankList>
    <MatcherExcludedList excluded={view.excluded} />
    <Stack sx={{ gap: 1.5 }}>
      <MatcherResultActions>
        <Button href={view.applyHref} variant="contained" color="primary" size="large">
          {matcherResultLabels.applyCta}
        </Button>
        <Button href={matcherMailHref} variant="outlined" size="large">
          {matcherResultLabels.askCta}
        </Button>
      </MatcherResultActions>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {view.handoffNote}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {matcherResultLabels.answersKeptHint}
      </Typography>
    </Stack>
  </>
);
