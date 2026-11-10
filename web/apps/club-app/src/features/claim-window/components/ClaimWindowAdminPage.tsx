import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { CLAIM_WINDOW_TITLE } from '../claim-window-copy';
import { useClaimWindowAdmin } from '../hooks/use-claim-window-admin';
import { ClaimWindowAdminBody } from './ClaimWindowAdminBody';

export const ClaimWindowAdminPage: FC = () => {
  const control = useClaimWindowAdmin();

  return (
    <KkScreen
      kind="detail"
      title={CLAIM_WINDOW_TITLE}
      origin={SYSTEM_ORIGIN}
      action={control.action}
    >
      <ClaimWindowAdminBody control={control} />
    </KkScreen>
  );
};
