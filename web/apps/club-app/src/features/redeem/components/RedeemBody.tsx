import type { FC } from 'react';
import type { RedeemScreenControl } from '../hooks/use-redeem-screen';
import { RedeemChecking } from './RedeemChecking';
import { RedeemDead } from './RedeemDead';
import { RedeemFailed } from './RedeemFailed';
import { RedeemPasswordForm } from './RedeemPasswordForm';
import { RedeemSignedIn } from './RedeemSignedIn';

interface RedeemBodyProps {
  control: RedeemScreenControl;
}

export const RedeemBody: FC<RedeemBodyProps> = ({ control }) => {
  const { stage } = control;

  if (stage.kind === 'dead') {
    return <RedeemDead />;
  }
  if (stage.kind === 'signedIn') {
    return <RedeemSignedIn />;
  }
  if (stage.kind === 'failed') {
    return <RedeemFailed failure={stage.failure} onRetry={control.retryLookup} />;
  }
  if (stage.kind === 'live') {
    return (
      <RedeemPasswordForm
        invitation={stage}
        isRedeeming={control.isRedeeming}
        redeemError={control.redeemError}
        onRedeem={control.redeem}
      />
    );
  }

  return <RedeemChecking />;
};
