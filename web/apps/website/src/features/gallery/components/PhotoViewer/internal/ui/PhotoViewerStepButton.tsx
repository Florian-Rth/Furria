import { kkTokens } from '@furria/ui';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { PhotoStepDirection } from '@/features/gallery/photo-viewer-steps';
import {
  resolvePhotoStepGlyph,
  resolvePhotoStepLabel,
} from '@/features/gallery/photo-viewer-steps';

const STEP_BUTTON_SX = {
  flexShrink: 0,
  width: '3.25rem',
  height: '3.25rem',
  color: 'inherit',
  border: `${kkTokens.line.hair}px solid`,
  borderColor: 'divider',
  typography: 'h2',
  fontFamily: kkTokens.font.body,
  fontWeight: 800,
  lineHeight: 1,
  '&:hover': { bgcolor: 'background.paper' },
  '&.Mui-disabled': {
    color: 'text.disabled',
    borderColor: 'action.disabledBackground',
  },
};

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
}) => {
  const label = resolvePhotoStepLabel(direction);
  const glyph = resolvePhotoStepGlyph(direction);
  const handleStep = (): void => onStep(direction);
  const buttonSx: SxProps<Theme> = [STEP_BUTTON_SX, ...(Array.isArray(sx) ? sx : [sx])];

  return (
    <IconButton aria-label={label} disabled={disabled} onClick={handleStep} sx={buttonSx}>
      {glyph}
    </IconButton>
  );
};
