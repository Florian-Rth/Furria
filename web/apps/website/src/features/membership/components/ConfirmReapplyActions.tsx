import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { ClubMailButton } from '@/components/ClubMailButton';
import {
  confirmMailLabel,
  confirmReapplyHref,
  confirmReapplyLabel,
} from '@/features/membership/confirmation-content';
import { ConfirmScreen } from './ConfirmScreen/ConfirmScreen';

export const ConfirmReapplyActions: FC = () => (
  <ConfirmScreen.Actions>
    <Button
      component={RouterLink}
      to={confirmReapplyHref}
      variant="contained"
      color="primary"
      size="large"
    >
      {confirmReapplyLabel}
    </Button>
    <ClubMailButton variant="outlined" size="large">
      {confirmMailLabel}
    </ClubMailButton>
  </ConfirmScreen.Actions>
);
