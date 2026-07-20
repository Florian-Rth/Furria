import { kkTokens } from '@furria/ui';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { FC } from 'react';
import { useUnlockForm } from '../hooks/use-unlock-form';

interface PreviewAccessDialogProps {
  open: boolean;
  onClose: () => void;
  onGranted: () => void;
}

export const PreviewAccessDialog: FC<PreviewAccessDialogProps> = ({ open, onClose, onGranted }) => {
  const { form, submit, isSubmitting, submitError } = useUnlockForm(onGranted);
  const { ref: passwordRef, ...passwordField } = form.register('password');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="unlock-dialog-title"
      aria-describedby="unlock-dialog-description"
      slotProps={{
        backdrop: {
          sx: (theme) => ({
            backgroundColor: theme.alpha(kkTokens.color.light.ink, 0.45),
          }),
        },
      }}
    >
      <form onSubmit={submit} noValidate>
        <DialogTitle id="unlock-dialog-title">Einlass für Tester</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DialogContentText id="unlock-dialog-description">
            Dieser Bereich ist noch nicht öffentlich. Wenn du zum Testen eingeladen bist, gib hier
            das Passwort ein.
          </DialogContentText>
          {submitError !== null && <Alert severity="error">{submitError}</Alert>}
          <TextField
            {...passwordField}
            inputRef={passwordRef}
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
