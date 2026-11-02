import { KkScoreDesk } from '@furria/ui/KkScoreDesk';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import {
  EVENINGS_TITLE,
  FACTS_LABEL,
  MANUAL_LABEL,
  SCORE_LABEL,
  STEP_PANE_LABEL,
} from '../score-copy';
import { ScoreEditDrawer } from './ScoreEditDrawer';
import { ScoreEveningsList } from './ScoreEveningsList';
import { ScoreFactsStrip } from './ScoreFactsStrip';
import { ScoreForYou } from './ScoreForYou';
import { ScoreManualList } from './ScoreManualList';
import { ScorePanel } from './ScorePanel';
import { ScoreReadinessStrip } from './ScoreReadinessStrip';
import { ScoreStepDrawer } from './ScoreStepDrawer';
import { ScoreStepPane } from './ScoreStepPane';

interface ScoreBodyProps {
  score: ActHub;
}

export const ScoreBody: FC<ScoreBodyProps> = ({ score }) => {
  const readiness =
    score.wide && score.showReadiness ? <ScoreReadinessStrip items={score.readiness} /> : null;
  const head = score.wide ? (
    <Stack sx={{ gap: 1 }}>
      <ScoreFactsStrip score={score} />
      {readiness}
    </Stack>
  ) : (
    <ScoreForYou score={score} />
  );
  const pane =
    score.pane === null ? null : (
      <KkScoreDesk.Pane label={STEP_PANE_LABEL}>
        <ScoreStepPane score={score} view={score.pane} framed onClose={null} />
      </KkScoreDesk.Pane>
    );
  const evenings =
    score.evenings.length === 0 ? null : (
      <KkScoreDesk.Evenings label={EVENINGS_TITLE}>
        <ScoreEveningsList score={score} />
      </KkScoreDesk.Evenings>
    );
  const drawer = score.wide ? null : <ScoreStepDrawer score={score} />;

  return (
    <KkScoreDesk>
      <KkScoreDesk.Intro>
        <KkText variant="caption" tone="secondary">
          {score.intro}
        </KkText>
      </KkScoreDesk.Intro>
      <KkScoreDesk.Head label={FACTS_LABEL}>{head}</KkScoreDesk.Head>
      <KkScoreDesk.Score label={SCORE_LABEL}>
        <ScorePanel score={score} />
      </KkScoreDesk.Score>
      <KkScoreDesk.List label={MANUAL_LABEL}>
        <ScoreManualList score={score} />
      </KkScoreDesk.List>
      {pane}
      {evenings}
      {drawer}
      <ScoreEditDrawer score={score} />
    </KkScoreDesk>
  );
};
