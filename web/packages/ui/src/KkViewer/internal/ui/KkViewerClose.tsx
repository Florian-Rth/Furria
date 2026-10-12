import IconButton from '@mui/material/IconButton';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import { useViewer } from '../logic/viewer-context';
import { viewerButtonSx } from './viewer-button-sx';

const CLOSE_BUTTON_SX = viewerButtonSx('2.75rem');

interface KkViewerCloseProps {
  sx?: KkSx;
}

export const KkViewerClose: FC<KkViewerCloseProps> = ({ sx }) => {
  const viewer = useViewer();

  return (
    <IconButton
      aria-label={viewer.labels.close}
      onClick={viewer.close}
      data-kk-viewer-close
      sx={[CLOSE_BUTTON_SX, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkIcon name="close" size="medium" />
    </IconButton>
  );
};
