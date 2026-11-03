import { KkScoreFacts } from '@furria/ui/KkScoreFacts';
import type { FC } from 'react';
import { EVENING_FACT, FACTS_LABEL, MUSIC_FACT, NONE } from '../score-copy';
import type { ScoreFactsView } from '../score-hub-views';
import { ScoreTrainingFact } from './ScoreTrainingFact';

interface ScoreFactsStripProps {
  facts: ScoreFactsView;
  inCast: boolean;
  withMusic?: boolean;
  onOpenTrainings: () => void;
}

export const ScoreFactsStrip: FC<ScoreFactsStripProps> = ({
  facts,
  inCast,
  withMusic = true,
  onOpenTrainings,
}) => {
  const training =
    facts.training === null ? null : (
      <ScoreTrainingFact
        key={facts.training.calendarEntryId}
        training={facts.training}
        saved={facts.trainingAnswer}
        inCast={inCast}
        onOpen={onOpenTrainings}
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
