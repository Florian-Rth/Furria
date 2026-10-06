import type { FC } from 'react';
import type { ConfirmationState } from '@/features/membership/hooks/use-confirmation';
import { ConfirmFailed } from './ConfirmFailed';
import { ConfirmPending } from './ConfirmPending';
import { ConfirmVerdict } from './ConfirmVerdict';

interface ConfirmBodyProps {
  state: ConfirmationState;
}

export const ConfirmBody: FC<ConfirmBodyProps> = ({ state }) => {
  const { stage } = state;

  if (stage.kind === 'settled') {
    return <ConfirmVerdict verdict={stage.verdict} />;
  }

  if (stage.kind === 'failed') {
    return <ConfirmFailed failure={stage.failure} onRetry={state.retry} />;
  }

  return <ConfirmPending />;
};
