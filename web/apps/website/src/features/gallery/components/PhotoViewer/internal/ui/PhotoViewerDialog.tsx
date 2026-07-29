import Dialog from '@mui/material/Dialog';
import { useReducedMotion } from 'motion/react';
import type { FC, KeyboardEventHandler, PropsWithChildren } from 'react';

interface PhotoViewerDialogProps extends PropsWithChildren {
  open: boolean;
  titleId: string;
  onClose: () => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
}

export const PhotoViewerDialog: FC<PhotoViewerDialogProps> = ({
  open,
  titleId,
  onClose,
  onKeyDown,
  children,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={onKeyDown}
      fullScreen
      aria-labelledby={titleId}
      transitionDuration={reducedMotion === true ? 0 : undefined}
      data-kk-photo-viewer
      slotProps={{
        paper: {
          sx: {
            display: 'flex',
            flexDirection: 'column',
            backgroundImage: 'none',
            bgcolor: 'background.default',
            color: 'text.primary',
          },
        },
      }}
    >
      {children}
    </Dialog>
  );
};
