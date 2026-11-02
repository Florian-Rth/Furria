import { KkScoreManual } from '@furria/ui/KkScoreManual';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import { MANUAL_LABEL, MOVEMENT_KEY, NO_STEPS, VIDEO_KEY } from '../score-copy';
import { ScoreFormation } from './ScoreFormation';

interface ScoreManualListProps {
  score: ActHub;
}

export const ScoreManualList: FC<ScoreManualListProps> = ({ score }) => {
  const { stage } = score.model;

  if (score.groups.length === 0) {
    return (
      <KkText variant="body2" tone="secondary">
        {NO_STEPS}
      </KkText>
    );
  }

  const groups = score.groups.map((group) => {
    const head = (
      <KkScoreManual.Head
        title={group.title}
        meta={group.meta}
        tone={score.tone}
        shade={group.shade}
      />
    );
    const rows = group.rows.map((row) => {
      const select = (): void => {
        score.selectRow(row.stepId);
      };
      const figure = (
        <ScoreFormation
          stage={stage}
          dots={row.dots}
          density="thumb"
          entranceDelay={row.entranceDelay}
        />
      );

      return (
        <KkScoreManual.Row
          key={row.stepId}
          label={row.label}
          number={row.number}
          title={row.title}
          meta={row.meta}
          figure={figure}
          movement={row.movement}
          video={row.video}
          flag={row.flag}
          selected={row.stepId === score.paneStepId}
          current={row.stepId === score.player.activeStepId}
          onSelect={select}
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
      {groups}
    </KkScoreManual>
  );
};
