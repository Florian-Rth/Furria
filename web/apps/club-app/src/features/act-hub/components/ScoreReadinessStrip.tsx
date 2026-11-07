import { KkScoreReadiness } from '@furria/ui/KkScoreReadiness';
import type { FC } from 'react';
import { READINESS_LABEL } from '../score-copy';
import type { ScoreReadinessView } from '../score-hub-views';

interface ScoreReadinessStripProps {
  items: readonly ScoreReadinessView[];
}

export const ScoreReadinessStrip: FC<ScoreReadinessStripProps> = ({ items }) => {
  const badges = items.map((item) => (
    <KkScoreReadiness.Badge
      key={item.key}
      icon={item.icon}
      label={item.label}
      value={item.value}
      hint={item.hint}
      state={item.state}
      onOpen={item.open}
    />
  ));

  return <KkScoreReadiness label={READINESS_LABEL}>{badges}</KkScoreReadiness>;
};
