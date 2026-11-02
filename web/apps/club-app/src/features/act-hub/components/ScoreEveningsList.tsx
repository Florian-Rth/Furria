import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkScoreEvenings } from '@furria/ui/KkScoreEvenings';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import { EVENINGS_TITLE, NUMBER_LABEL, OPEN_NUMBER } from '../score-copy';

interface ScoreEveningsListProps {
  score: ActHub;
}

export const ScoreEveningsList: FC<ScoreEveningsListProps> = ({ score }) => {
  const rows = score.evenings.map((evening) => (
    <KkScoreEvenings.Row
      key={evening.eventId}
      numberLabel={NUMBER_LABEL}
      number={evening.number}
      openNumberLabel={OPEN_NUMBER}
      title={evening.title}
      date={evening.date}
      hint={evening.hint}
      onOpen={evening.open}
    />
  ));

  return (
    <KkPanelSection title={EVENINGS_TITLE}>
      <KkScoreEvenings label={EVENINGS_TITLE}>{rows}</KkScoreEvenings>
    </KkPanelSection>
  );
};
