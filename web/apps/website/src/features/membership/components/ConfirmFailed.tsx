import Button from '@mui/material/Button';
import type { FC } from 'react';
import { ClubMailButton } from '@/components/ClubMailButton';
import {
  CONFIRMATION_FAILURE_TEXTS,
  confirmFailedEyebrow,
  confirmFailedHeadline,
  confirmMailLabel,
  confirmRetryLabel,
} from '@/features/membership/confirmation-content';
import type { ConfirmationFailure } from '@/features/membership/confirmation-stage';
import { ConfirmScreen } from './ConfirmScreen/ConfirmScreen';

interface ConfirmFailedProps {
  failure: ConfirmationFailure;
  onRetry: () => void;
}

export const ConfirmFailed: FC<ConfirmFailedProps> = ({ failure, onRetry }) => (
  <ConfirmScreen>
    <ConfirmScreen.Title eyebrow={confirmFailedEyebrow} headline={confirmFailedHeadline} />
    <ConfirmScreen.Lead>{CONFIRMATION_FAILURE_TEXTS[failure]}</ConfirmScreen.Lead>
    <ConfirmScreen.Actions>
      <Button onClick={onRetry} variant="contained" color="primary" size="large">
        {confirmRetryLabel}
      </Button>
      <ClubMailButton variant="outlined" size="large">
        {confirmMailLabel}
      </ClubMailButton>
    </ConfirmScreen.Actions>
  </ConfirmScreen>
);
