import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  confirmEventsHref,
  confirmEventsLabel,
  confirmHomeHref,
  confirmHomeLabel,
} from '@/features/membership/confirmation-content';
import { ConfirmScreen } from './ConfirmScreen/ConfirmScreen';

export const ConfirmOnwardActions: FC = () => (
  <ConfirmScreen.Actions>
    <Button
      component={RouterLink}
      to={confirmEventsHref}
      variant="contained"
      color="primary"
      size="large"
    >
      {confirmEventsLabel}
    </Button>
    <Button component={RouterLink} to={confirmHomeHref} variant="outlined" size="large">
      {confirmHomeLabel}
    </Button>
  </ConfirmScreen.Actions>
);
