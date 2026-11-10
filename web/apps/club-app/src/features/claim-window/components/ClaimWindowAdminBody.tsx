import { KkPanelStack } from '@furria/ui/KkPanelStack';
import type { FC } from 'react';
import { RedeemChecking } from '@/features/redeem/components/RedeemChecking';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { SystemError } from '@/features/system/components/SystemError';
import { WINDOW_DENIED_MESSAGE, WINDOW_FAILED_MESSAGE } from '../claim-window-copy';
import type { ClaimWindowAdminControl } from '../hooks/use-claim-window-admin';
import { ClaimWindowAddressPanel } from './ClaimWindowAddressPanel';
import { ClaimWindowClaimList } from './ClaimWindowClaimList';
import { ClaimWindowEndSection } from './ClaimWindowEndSection';
import { ClaimWindowStatePanel } from './ClaimWindowStatePanel';

interface ClaimWindowAdminBodyProps {
  control: ClaimWindowAdminControl;
}

export const ClaimWindowAdminBody: FC<ClaimWindowAdminBodyProps> = ({ control }) => {
  const { read } = control;

  switch (read.kind) {
    case 'loading':
      return <RedeemChecking />;
    case 'denied':
      return <AccessDenied message={WINDOW_DENIED_MESSAGE} />;
    case 'failed':
      return (
        <SystemError
          message={WINDOW_FAILED_MESSAGE}
          retrying={control.isRetrying}
          onRetry={control.retry}
        />
      );
    case 'shown':
      return (
        <KkPanelStack>
          <ClaimWindowStatePanel window={read.overview.window} />
          <ClaimWindowEndSection
            end={control.end}
            onDayChange={control.setEndDay}
            onTimeChange={control.setEndTime}
          />
          <ClaimWindowAddressPanel address={control.address} />
          <ClaimWindowClaimList claims={read.overview.claims} />
        </KkPanelStack>
      );
  }
};
