import type { FC } from 'react';
import type { ActDetailsPageState } from '@/features/acts/hooks/use-act-details-page';
import type { ActStudio, ActStudioResponse, StudioTraining } from '@/features/acts/schemas';
import { useAttendanceMarks } from '../api';
import { useTrainingRollPane } from '../hooks/use-training-roll-pane';
import { ActTrainingRollSide } from './ActTrainingRollSide';

interface ActTrainingRollPanelProps {
  page: ActDetailsPageState;
  data: ActStudioResponse;
  studio: ActStudio;
  training: StudioTraining;
}

export const ActTrainingRollPanel: FC<ActTrainingRollPanelProps> = ({
  page,
  data,
  studio,
  training,
}) => {
  const marks = useAttendanceMarks(data.act.actId);
  const pane = useTrainingRollPane(
    {
      studio,
      training,
      cast: data.act.cast,
      canMark: data.viewer.canMarkAttendance,
      onStart: page.startTraining,
    },
    marks,
  );

  return <ActTrainingRollSide isWide={page.isWide} pane={pane} onClose={page.closeRoll} />;
};
