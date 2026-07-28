import { kkTokens } from '@furria/ui';
import IconButton from '@mui/material/IconButton';
import type { FC } from 'react';
import { photoViewerLabels } from '@/features/gallery/gallery-content';

interface PhotoViewerCloseButtonProps {
  onClose: () => void;
}

export const PhotoViewerCloseButton: FC<PhotoViewerCloseButtonProps> = ({ onClose }) => (
  <IconButton
    aria-label={photoViewerLabels.close}
    onClick={onClose}
    sx={{
      flexShrink: 0,
      width: '2.75rem',
      height: '2.75rem',
      color: 'inherit',
      border: `${kkTokens.line.hair}px solid`,
      borderColor: 'divider',
      fontFamily: kkTokens.font.body,
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1,
      '&:hover': { bgcolor: 'background.paper' },
    }}
  >
    ✕
  </IconButton>
);
