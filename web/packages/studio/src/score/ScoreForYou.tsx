import { ScoreFormation } from '@furria/studio/ScoreFormation';
import {
  FOR_YOU_TITLE,
  NEXT_TITLE,
  ownPlaceLabelOf,
  PLACE_LABEL,
  PRACTISE_LABEL,
} from '@furria/studio/score-copy';
import type { ScoreYouView } from '@furria/studio/score-views';
import type { StudioStage } from '@furria/studio/studio-schemas';
import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkScoreYou } from '@furria/ui/KkScoreYou';
import { KkText } from '@furria/ui/KkText';
import type { FC, ReactNode } from 'react';

interface ScoreForYouProps {
  you: ScoreYouView | null;
  stage: StudioStage;
  facts: ReactNode;
  onPractise: (() => void) | null;
}

export const ScoreForYou: FC<ScoreForYouProps> = ({ you, stage, facts, onPractise }) => {
  if (you === null) {
    return <KkPanelSection title={NEXT_TITLE}>{facts}</KkPanelSection>;
  }

  const figure =
    you.place === null || you.dots.length === 0 ? null : (
      <ScoreFormation
        label={ownPlaceLabelOf(you.place)}
        stage={stage}
        dots={you.dots}
        density="card"
      />
    );
  const place =
    you.place === null ? null : <KkScoreYou.Place label={PLACE_LABEL} number={you.place} />;
  const practise =
    onPractise === null ? null : (
      <KkButton startIcon={<KkIcon name="play" size="small" />} onClick={onPractise}>
        {PRACTISE_LABEL}
      </KkButton>
    );
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
