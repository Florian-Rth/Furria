import { ScoreFormation } from '@furria/studio/ScoreFormation';
import type { ScoreRowView } from '@furria/studio/score-views';
import type { StudioStage } from '@furria/studio/studio-schemas';
import { KkScoreManual } from '@furria/ui/KkScoreManual';
import type { FC } from 'react';

interface ScoreManualRowProps {
  row: ScoreRowView;
  stage: StudioStage;
  selected: boolean;
  current: boolean;
  onSelect: (stepId: number) => void;
}

export const ScoreManualRow: FC<ScoreManualRowProps> = ({
  row,
  stage,
  selected,
  current,
  onSelect,
}) => {
  const select = (): void => {
    onSelect(row.stepId);
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
      label={row.label}
      number={row.number}
      title={row.title}
      meta={row.meta}
      figure={figure}
      movement={row.movement}
      video={row.video}
      flag={row.flag}
      selected={selected}
      current={current}
      onSelect={select}
    />
  );
};
