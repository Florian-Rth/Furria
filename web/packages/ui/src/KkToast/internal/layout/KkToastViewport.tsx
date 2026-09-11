import Box from '@mui/material/Box';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import type { FC, SyntheticEvent } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkToastEntry } from '../logic/toast-queue';
import { toastDurationMs } from '../logic/toast-queue';
import { KkToastItem } from '../ui/KkToastItem';

const ANCHOR = { vertical: 'bottom', horizontal: 'right' } as const;
const GUTTER = 8;
const DESKTOP_INSET = 24;
const RISE_ORIGIN = { transformOrigin: 'bottom center' } as const;

interface KkToastViewportProps {
  entry: KkToastEntry | null;
  isOpen: boolean;
  dismissLabel: string;
  onDismiss: () => void;
  onExited: () => void;
}

export const KkToastViewport: FC<KkToastViewportProps> = ({
  entry,
  isOpen,
  dismissLabel,
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
        slotProps={{ transition: { onExited, style: RISE_ORIGIN } }}
        sx={{
          left: { xs: GUTTER, desktop: 'auto' },
          right: { xs: GUTTER, desktop: DESKTOP_INSET },
          bottom: { xs: kkTokens.layout.curtainClearance, desktop: DESKTOP_INSET },
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
            dismissLabel={dismissLabel}
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
