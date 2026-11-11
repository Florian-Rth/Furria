import type { FC } from 'react';
import { RedeemChecking } from '@/features/redeem/components/RedeemChecking';
import { useClaimScreen } from '../hooks/use-claim-screen';
import { useWindowClaimForm } from '../hooks/use-window-claim-form';
import { ClaimWindowClosed } from './ClaimWindowClosed';
import { WindowClaimAnswer } from './WindowClaimAnswer';
import { WindowClaimForm } from './WindowClaimForm';

export const ClaimWindowView: FC = () => {
  const control = useClaimScreen();
  const claimForm = useWindowClaimForm(control.claim);
  const { view } = control;

  switch (view.kind) {
    case 'checking':
    case 'entering':
      return <RedeemChecking />;
    case 'closed':
      return <ClaimWindowClosed />;
    case 'answer':
      return <WindowClaimAnswer answer={view.answer} onRetry={control.retry} />;
    case 'form':
      return (
        <WindowClaimForm
          form={claimForm.form}
          onSubmit={claimForm.submit}
          isClaiming={control.isClaiming}
          failure={control.failure}
        />
      );
  }
};
