import { ScoreManualRow } from '@furria/studio/ScoreManualRow';
import { MANUAL_LABEL, MOVEMENT_KEY, NO_STEPS, VIDEO_KEY } from '@furria/studio/score-copy';
import type { ScoreGroupView } from '@furria/studio/score-views';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkScoreManual } from '@furria/ui/KkScoreManual';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';

interface ScoreManualListProps {
  groups: readonly ScoreGroupView[];
  stage: StudioStage;
  tone: KkGroupTone | null;
  selectedStepId: number | null;
  currentStepId: number | null;
  onSelect: (stepId: number) => void;
}

export const ScoreManualList: FC<ScoreManualListProps> = ({
  groups,
  stage,
  tone,
  selectedStepId,
  currentStepId,
  onSelect,
}) => {
  if (groups.length === 0) {
    return (
      <KkText variant="body2" tone="secondary">
        {NO_STEPS}
      </KkText>
    );
  }

  const sections = groups.map((group) => {
    const head = (
      <KkScoreManual.Head title={group.title} meta={group.meta} tone={tone} shade={group.shade} />
    );
    const rows = group.rows.map((row) => {
      const selected = row.stepId === selectedStepId;
      const current = row.stepId === currentStepId;

      return (
        <ScoreManualRow
          key={row.stepId}
          row={row}
          stage={stage}
          selected={selected}
          current={current}
          onSelect={onSelect}
        />
      );
    });

    return (
      <KkScoreManual.Group key={group.key} head={head} anchor={group.anchor}>
        {rows}
      </KkScoreManual.Group>
    );
  });

  return (
    <KkScoreManual label={MANUAL_LABEL}>
      <KkScoreManual.Legend movementLabel={MOVEMENT_KEY} videoLabel={VIDEO_KEY} />
      {sections}
    </KkScoreManual>
  );
};
