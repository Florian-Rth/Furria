import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import { useViewer } from '../logic/viewer-context';

interface KkViewerCaptionProps {
  sx?: KkSx;
}

export const KkViewerCaption: FC<KkViewerCaptionProps> = ({ sx }) => {
  const { item } = useViewer();

  if (item.caption === undefined) {
    return null;
  }

  return (
    <Typography
      variant="body1"
      component="p"
      data-kk-viewer-caption
      sx={[
        { fontWeight: 600, lineHeight: 1.5, textWrap: 'pretty', maxWidth: '52rem' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {item.caption}
    </Typography>
  );
};
