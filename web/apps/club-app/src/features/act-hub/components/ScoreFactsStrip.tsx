import { KkScoreFacts } from '@furria/ui/KkScoreFacts';
import type { FC } from 'react';
import { FACTS_LABEL, MUSIC_FACT } from '../score-copy';
import type { ScoreFactsView } from '../score-hub-views';
import { ScoreTrainingFact } from './ScoreTrainingFact';

interface ScoreFactsStripProps {
  facts: ScoreFactsView;
  inCast: boolean;
  withMusic?: boolean;
  onOpenTraining: () => void;
}

export const ScoreFactsStrip: FC<ScoreFactsStripProps> = ({
  facts,
  inCast,
  withMusic = true,
  onOpenTraining,
}) => {
  const training =
    facts.training === null ? null : (
      <ScoreTrainingFact
        key={facts.training.calendarEntryId}
        training={facts.training}
        saved={facts.trainingAnswer}
        inCast={inCast}
        onOpen={onOpenTraining}
      />
    );
  const music =
    withMusic && facts.music !== null ? (
      <KkScoreFacts.Fact icon="music" label={MUSIC_FACT} value={facts.music} />
    ) : null;

  return (
    <KkScoreFacts label={FACTS_LABEL}>
      {training}
      {music}
    </KkScoreFacts>
  );
};
