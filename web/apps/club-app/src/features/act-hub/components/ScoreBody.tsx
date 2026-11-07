import { ScoreForYou } from '@furria/studio/ScoreForYou';
import { ScoreManualList } from '@furria/studio/ScoreManualList';
import { ScorePanel } from '@furria/studio/ScorePanel';
import { ScoreStepDrawer } from '@furria/studio/ScoreStepDrawer';
import { ScoreStepPane } from '@furria/studio/ScoreStepPane';
import { MANUAL_LABEL, SCORE_LABEL } from '@furria/studio/score-copy';
import { KkScoreDesk } from '@furria/ui/KkScoreDesk';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import { EVENINGS_TITLE, FACTS_LABEL } from '../score-copy';
import { ScoreEditDrawer } from './ScoreEditDrawer';
import { ScoreEveningsList } from './ScoreEveningsList';
import { ScoreFactsStrip } from './ScoreFactsStrip';
import { ScoreReadinessStrip } from './ScoreReadinessStrip';

interface ScoreBodyProps {
  score: ActHub;
}

export const ScoreBody: FC<ScoreBodyProps> = ({ score }) => {
  const readiness =
    score.wide && score.showReadiness ? <ScoreReadinessStrip items={score.readiness} /> : null;
  const nextFacts = (
    <ScoreFactsStrip
      facts={score.facts}
      inCast={score.inCast}
      withMusic={false}
      onOpenTrainings={score.openTrainings}
    />
  );
  const drawerReadiness = score.showReadiness && !score.wide ? score.readiness : null;
  const head = score.wide ? (
    <Stack sx={{ gap: 1 }}>
      <ScoreFactsStrip
        facts={score.facts}
        inCast={score.inCast}
        onOpenTrainings={score.openTrainings}
      />
      {readiness}
    </Stack>
  ) : (
    <ScoreForYou
      you={score.you}
      stage={score.model.stage}
      facts={nextFacts}
      onPractise={score.practise}
    />
  );
  const pane =
    score.pane === null ? null : (
      <KkScoreDesk.Pane>
        <ScoreStepPane view={score.pane} tools={score.stepTools} framed onClose={null} />
      </KkScoreDesk.Pane>
    );
  const evenings =
    score.evenings.length === 0 ? null : (
      <KkScoreDesk.Evenings label={EVENINGS_TITLE}>
        <ScoreEveningsList evenings={score.evenings} />
      </KkScoreDesk.Evenings>
    );
  const drawer = score.wide ? null : (
    <ScoreStepDrawer
      view={score.drawerStep}
      tools={score.stepTools}
      onClose={score.route.closeStep}
    />
  );

  return (
    <KkScoreDesk>
      <KkScoreDesk.Intro>
        <KkText variant="caption" tone="secondary">
          {score.intro}
        </KkText>
      </KkScoreDesk.Intro>
      <KkScoreDesk.Head label={FACTS_LABEL}>{head}</KkScoreDesk.Head>
      <KkScoreDesk.Score label={SCORE_LABEL}>
        <ScorePanel
          player={score.player}
          nowStep={score.nowStep}
          segments={score.model.segments}
          marks={score.model.marks}
          parts={score.parts}
          steps={score.steps}
          tone={score.tone}
          wide={score.wide}
          reveal={score.reveal}
          selectedStepId={score.paneStepId}
          onSelectStep={score.selectRow}
          onSelectPart={score.selectPart}
        />
      </KkScoreDesk.Score>
      <KkScoreDesk.List label={MANUAL_LABEL}>
        <ScoreManualList
          groups={score.groups}
          stage={score.model.stage}
          tone={score.tone}
          selectedStepId={score.paneStepId}
          currentStepId={score.player.activeStepId}
          onSelect={score.selectRow}
        />
      </KkScoreDesk.List>
      {pane}
      {evenings}
      {drawer}
      <ScoreEditDrawer
        open={score.editOpen}
        doors={score.doors}
        readiness={drawerReadiness}
        onClose={score.route.closeEdit}
      />
    </KkScoreDesk>
  );
};
