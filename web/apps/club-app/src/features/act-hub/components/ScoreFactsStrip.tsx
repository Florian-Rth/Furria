import { KkScoreFacts } from '@furria/ui/KkScoreFacts';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import { EVENING_FACT, FACTS_LABEL, MUSIC_FACT, NONE } from '../score-copy';
import { ScoreTrainingFact } from './ScoreTrainingFact';

interface ScoreFactsStripProps {
  score: ActHub;
  withMusic?: boolean;
}

export const ScoreFactsStrip: FC<ScoreFactsStripProps> = ({ score, withMusic = true }) => {
  const { facts } = score;
  const training =
    facts.training === null ? null : (
      <ScoreTrainingFact
        key={facts.training.calendarEntryId}
        training={facts.training}
        saved={facts.trainingAnswer}
        inCast={score.inCast}
        onOpen={score.openTrainings}
      />
    );
  const evening = facts.evening ?? NONE;
  const eveningOpen = facts.eveningOpen ?? undefined;
  const music =
    withMusic && facts.music !== null ? (
      <KkScoreFacts.Fact icon="music" label={MUSIC_FACT} value={facts.music} />
    ) : null;

  return (
    <KkScoreFacts label={FACTS_LABEL}>
      {training}
      <KkScoreFacts.Fact
        icon="stage"
        label={EVENING_FACT}
        value={evening}
        openLabel={facts.evening ?? undefined}
        onOpen={eveningOpen}
      />
      {music}
    </KkScoreFacts>
  );
};
