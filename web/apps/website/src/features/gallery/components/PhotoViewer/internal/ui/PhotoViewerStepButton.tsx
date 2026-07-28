import { kkTokens } from '@furria/ui';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { photoViewerLabels } from '@/features/gallery/gallery-content';
import type { PhotoStepDirection } from '@/features/gallery/photo-viewer-steps';

interface PhotoViewerStepButtonProps {
  direction: PhotoStepDirection;
  disabled: boolean;
  onStep: (direction: PhotoStepDirection) => void;
  sx?: SxProps<Theme>;
}

export const PhotoViewerStepButton: FC<PhotoViewerStepButtonProps> = ({
  direction,
  disabled,
  onStep,
  sx,
}) => (
  <IconButton
    aria-label={direction === -1 ? photoViewerLabels.previous : photoViewerLabels.next}
    disabled={disabled}
    onClick={() => onStep(direction)}
    sx={[
      {
        flexShrink: 0,
        width: '3.25rem',
        height: '3.25rem',
        color: 'inherit',
        border: `${kkTokens.line.hair}px solid`,
        borderColor: 'divider',
        fontFamily: kkTokens.font.body,
        fontSize: '1.75rem',
        fontWeight: 800,
        lineHeight: 1,
        '&:hover': { bgcolor: 'background.paper' },
        '&.Mui-disabled': {
          color: 'text.disabled',
          borderColor: 'action.disabledBackground',
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {direction === -1 ? '‹' : '›'}
  </IconButton>
);
