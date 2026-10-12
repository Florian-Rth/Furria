import IconButton from '@mui/material/IconButton';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import type { KkViewerStepDelta } from '../../viewer-types';
import { useViewer } from '../logic/viewer-context';
import { viewerButtonSx } from './viewer-button-sx';

const STEP_BUTTON_SX = viewerButtonSx('3.25rem');

interface KkViewerStepButtonProps {
  direction: KkViewerStepDelta;
  sx?: KkSx;
}

export const KkViewerStepButton: FC<KkViewerStepButtonProps> = ({ direction, sx }) => {
  const viewer = useViewer();
  const backward = direction === -1;
  const label = backward ? viewer.labels.previous : viewer.labels.next;
  const icon = backward ? 'back' : 'chevron';
  const disabled = backward ? !viewer.hasPrevious : !viewer.hasNext;

  const handleStep = (): void => {
    viewer.step(direction);
  };

  return (
    <IconButton
      aria-label={label}
      disabled={disabled}
      onClick={handleStep}
      data-kk-viewer-step={direction}
      sx={[STEP_BUTTON_SX, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkIcon name={icon} size="large" />
    </IconButton>
  );
};
