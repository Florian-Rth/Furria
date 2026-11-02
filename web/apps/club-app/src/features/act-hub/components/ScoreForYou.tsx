import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkScoreYou } from '@furria/ui/KkScoreYou';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import {
  FOR_YOU_TITLE,
  NEXT_TITLE,
  ownPlaceLabelOf,
  PLACE_LABEL,
  PRACTISE_LABEL,
} from '../score-copy';
import { ScoreFactsStrip } from './ScoreFactsStrip';
import { ScoreFormation } from './ScoreFormation';

interface ScoreForYouProps {
  score: ActHub;
}

export const ScoreForYou: FC<ScoreForYouProps> = ({ score }) => {
  const { you, model } = score;
  const facts = <ScoreFactsStrip score={score} withMusic={false} />;

  if (you === null) {
    return <KkPanelSection title={NEXT_TITLE}>{facts}</KkPanelSection>;
  }

  const figure =
    you.place === null || you.dots.length === 0 ? null : (
      <ScoreFormation
        label={ownPlaceLabelOf(you.place)}
        stage={model.stage}
        dots={you.dots}
        density="card"
      />
    );
  const place =
    you.place === null ? null : <KkScoreYou.Place label={PLACE_LABEL} number={you.place} />;
  const practise = score.canPlay ? (
    <KkButton startIcon={<KkIcon name="play" size="small" />} onClick={score.practise}>
      {PRACTISE_LABEL}
    </KkButton>
  ) : null;
  const meta =
    you.practiseMeta === null ? null : (
      <KkText variant="caption" tone="secondary">
        {you.practiseMeta}
      </KkText>
    );
  const lead =
    place === null && practise === null ? null : (
      <KkScoreYou.Lead figure={figure}>
        {place}
        {practise}
        {meta}
      </KkScoreYou.Lead>
    );

  return (
    <KkPanelSection title={FOR_YOU_TITLE}>
      <KkScoreYou label={FOR_YOU_TITLE}>
        {lead}
        {facts}
      </KkScoreYou>
    </KkPanelSection>
  );
};
