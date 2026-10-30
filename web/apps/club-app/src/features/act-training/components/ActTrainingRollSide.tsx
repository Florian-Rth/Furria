import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { CLOSE_LABEL } from '@/features/acts/acts-copy';
import type { TrainingRollPaneState } from '../hooks/use-training-roll-pane';
import { ROLL_PANE_LABEL } from '../training-copy';
import { ActTrainingRollPane } from './ActTrainingRollPane';

const PANE_SPAN = 5;

interface ActTrainingRollSideProps {
  isWide: boolean;
  pane: TrainingRollPaneState;
  onClose: () => void;
}

export const ActTrainingRollSide: FC<ActTrainingRollSideProps> = ({ isWide, pane, onClose }) => {
  const body = <ActTrainingRollPane pane={pane} framed={isWide} onClose={onClose} />;

  if (!isWide) {
    return (
      <KkBottomDrawer open label={ROLL_PANE_LABEL} closeLabel={CLOSE_LABEL} onClose={onClose}>
        {body}
      </KkBottomDrawer>
    );
  }

  return <KkMasterDetail.Detail span={PANE_SPAN}>{body}</KkMasterDetail.Detail>;
};
