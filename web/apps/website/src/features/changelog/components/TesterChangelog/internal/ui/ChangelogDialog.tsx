import { kkTokens } from '@furria/ui';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { FC, PropsWithChildren } from 'react';
import { changelogCopy } from '@/features/changelog/changelog-copy';
import {
  CHANGELOG_DIALOG_DESCRIPTION_ID,
  CHANGELOG_DIALOG_TITLE_ID,
} from '../logic/changelog-dialog-a11y';

interface ChangelogDialogProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
}

export const ChangelogDialog: FC<ChangelogDialogProps> = ({ open, onClose, children }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    aria-labelledby={CHANGELOG_DIALOG_TITLE_ID}
    aria-describedby={CHANGELOG_DIALOG_DESCRIPTION_ID}
    slotProps={{
      backdrop: {
        sx: (theme) => ({ backgroundColor: theme.alpha(kkTokens.color.light.ink, 0.45) }),
      },
      paper: { sx: { boxShadow: kkTokens.shadow.raised } },
    }}
  >
    <DialogTitle id={CHANGELOG_DIALOG_TITLE_ID}>{changelogCopy.dialogTitle}</DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <DialogContentText id={CHANGELOG_DIALOG_DESCRIPTION_ID} sx={{ textWrap: 'pretty' }}>
        {changelogCopy.dialogIntro}
      </DialogContentText>
      {children}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">
        {changelogCopy.close}
      </Button>
    </DialogActions>
  </Dialog>
);
