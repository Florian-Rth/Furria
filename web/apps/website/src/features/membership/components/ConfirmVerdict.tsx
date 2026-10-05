import type { FC } from 'react';
import { CONFIRMATION_VERDICT_VIEWS } from '@/features/membership/confirmation-content';
import type { ConfirmationVerdict } from '@/features/membership/confirmation-stage';
import { ConfirmNextStep } from './ConfirmNextStep';
import { ConfirmScreen } from './ConfirmScreen/ConfirmScreen';

interface ConfirmVerdictProps {
  verdict: ConfirmationVerdict;
}

export const ConfirmVerdict: FC<ConfirmVerdictProps> = ({ verdict }) => {
  const view = CONFIRMATION_VERDICT_VIEWS[verdict];

  return (
    <ConfirmScreen>
      <ConfirmScreen.Title eyebrow={view.eyebrow} headline={view.headline} />
      <ConfirmScreen.Lead>{view.text}</ConfirmScreen.Lead>
      <ConfirmNextStep next={view.next} />
    </ConfirmScreen>
  );
};
