import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { CLAIM_WINDOW_TITLE } from '../claim-window-copy';
import { useClaimWindowAdmin } from '../hooks/use-claim-window-admin';
import { ClaimWindowAdminBody } from './ClaimWindowAdminBody';
import { ClaimWindowHelp } from './ClaimWindowHelp';

export const ClaimWindowAdminPage: FC = () => {
  const control = useClaimWindowAdmin();
  const help = toScreenHelp(<ClaimWindowHelp />);

  return (
    <KkScreen
      kind="detail"
      title={CLAIM_WINDOW_TITLE}
      origin={SYSTEM_ORIGIN}
      action={control.action}
      help={help}
    >
      <ClaimWindowAdminBody control={control} />
    </KkScreen>
  );
};
