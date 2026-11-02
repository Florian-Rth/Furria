import { KkScoreReadiness } from '@furria/ui/KkScoreReadiness';
import type { FC } from 'react';
import type { ScoreReadinessView } from '../hooks/use-act-hub';
import { READINESS_LABEL } from '../score-copy';

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
