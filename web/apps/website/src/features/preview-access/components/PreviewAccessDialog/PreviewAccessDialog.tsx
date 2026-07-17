import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { FC } from 'react';
import { useUnlockForm } from '../../hooks/use-unlock-form';

interface PreviewAccessDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PreviewAccessDialog: FC<PreviewAccessDialogProps> = ({ open, onClose }) => {
  const { form, submit, isSubmitting, submitError } = useUnlockForm(onClose);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        // No backdrop-filter here: a viewport-sized backdrop blur re-filters on
        // nearly every frame in Chromium and lags badly. The page content behind
        // the dialog is blurred via a plain `filter` where it is cheap (route).
        backdrop: {
          sx: {
            backgroundColor: 'rgba(26, 20, 17, 0.45)',
          },
        },
      }}
    >
      <form onSubmit={submit} noValidate>
        <DialogTitle>Einlass für Tester</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DialogContentText>
            Dieser Bereich ist noch nicht öffentlich. Wenn du zum Testen eingeladen bist, gib hier
            das Passwort ein.
          </DialogContentText>
          {submitError !== null && <Alert severity="error">{submitError}</Alert>}
          <TextField
            {...form.register('password')}
            type="password"
            label="Passwort"
            autoComplete="current-password"
            autoFocus
            fullWidth
            error={form.formState.errors.password !== undefined}
            helperText={form.formState.errors.password?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Abbrechen
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Einlass
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
