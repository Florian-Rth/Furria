import Box from '@mui/material/Box';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import type { FC, SyntheticEvent } from 'react';
import type { KkToastEntry } from '../logic/toast-queue';
import { toastDurationMs } from '../logic/toast-queue';
import { KkToastItem } from '../ui/KkToastItem';

const ANCHOR = { vertical: 'bottom', horizontal: 'right' } as const;
const GUTTER = 8;
const CURTAIN_CLEARANCE = 84;
const DESKTOP_INSET = 24;

interface KkToastViewportProps {
  entry: KkToastEntry | null;
  isOpen: boolean;
  onDismiss: () => void;
  onExited: () => void;
}

export const KkToastViewport: FC<KkToastViewportProps> = ({
  entry,
  isOpen,
  onDismiss,
  onExited,
}) => {
  const close = (_event: SyntheticEvent | Event, reason: SnackbarCloseReason): void => {
    if (reason === 'clickaway') {
      return;
    }

    onDismiss();
  };

  const toast =
    entry === null ? null : (
      <Snackbar
        key={entry.id}
        open={isOpen}
        anchorOrigin={ANCHOR}
        autoHideDuration={toastDurationMs(entry.tone)}
        onClose={close}
        slotProps={{ transition: { onExited } }}
        sx={{
          left: { xs: GUTTER, desktop: 'auto' },
          right: { xs: GUTTER, desktop: DESKTOP_INSET },
          bottom: { xs: CURTAIN_CLEARANCE, desktop: DESKTOP_INSET },
          justifyContent: { xs: 'center', desktop: 'flex-end' },
        }}
      >
        <Stack
          data-kk-toast-slot
          sx={{ minWidth: 0, maxWidth: '100%', width: { xs: '100%', desktop: 'auto' } }}
        >
          <KkToastItem
            tone={entry.tone}
            message={entry.message}
            icon={entry.icon}
            onDismiss={onDismiss}
          />
        </Stack>
      </Snackbar>
    );

  return (
    <Box role="status" aria-live="polite" data-kk-toast-viewport>
      {toast}
    </Box>
  );
};
