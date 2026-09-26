import type { FC } from 'react';
import type { RedeemScreenControl } from '../hooks/use-redeem-screen';
import { RedeemChecking } from './RedeemChecking';
import { RedeemConfirmForm } from './RedeemConfirmForm';
import { RedeemDead } from './RedeemDead';
import { RedeemDetailsForm } from './RedeemDetailsForm';
import { RedeemFailed } from './RedeemFailed';
import { RedeemSignedIn } from './RedeemSignedIn';

interface RedeemBodyProps {
  control: RedeemScreenControl;
}

export const RedeemBody: FC<RedeemBodyProps> = ({ control }) => {
  const { stage, errors } = control;

  if (stage.kind === 'dead') {
    return <RedeemDead />;
  }
  if (stage.kind === 'signedIn') {
    return <RedeemSignedIn />;
  }
  if (stage.kind === 'failed') {
    return <RedeemFailed failure={stage.failure} onRetry={control.retryLookup} />;
  }
  if (stage.kind === 'checking') {
    return <RedeemChecking />;
  }
  if (stage.step.kind === 'confirm') {
    return (
      <RedeemConfirmForm
        invitation={stage}
        loginEmail={stage.step.loginEmail}
        expiresAt={stage.step.expiresAt}
        hasResentCode={control.hasResentCode}
        isRedeeming={control.isRedeeming}
        codeError={errors.confirmationCode}
        footerError={errors.footer}
        onConfirm={control.confirm}
        onResend={control.resendCode}
        onChangeLoginEmail={control.changeLoginEmail}
        onEdit={control.clearRefusal}
      />
    );
  }

  const defaultLoginEmail = control.draftLoginEmail ?? stage.suggestedLoginEmail ?? '';

  return (
    <RedeemDetailsForm
      invitation={stage}
      defaultLoginEmail={defaultLoginEmail}
      isRedeeming={control.isRedeeming}
      loginEmailError={errors.loginEmail}
      footerError={errors.footer}
      onRedeem={control.submitDetails}
      onEdit={control.clearRefusal}
    />
  );
};
