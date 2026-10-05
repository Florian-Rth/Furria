import type { FC } from 'react';
import {
  confirmPendingEyebrow,
  confirmPendingHeadline,
} from '@/features/membership/confirmation-content';
import { ConfirmScreen } from './ConfirmScreen/ConfirmScreen';

export const ConfirmPending: FC = () => (
  <ConfirmScreen>
    <ConfirmScreen.Title eyebrow={confirmPendingEyebrow} headline={confirmPendingHeadline} />
    <ConfirmScreen.Progress />
  </ConfirmScreen>
);
