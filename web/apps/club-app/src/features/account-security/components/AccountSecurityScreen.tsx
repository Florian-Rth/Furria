import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, PROFILE_ORIGIN } from '@/features/session/app-sections';
import { SECURITY_TITLE } from '../account-security-labels';
import { useSecurityHelpViewer } from '../hooks/use-security-help-viewer';
import { AccountSecurityBody } from './AccountSecurityBody';
import { AccountSecurityHelp } from './AccountSecurityHelp';

export const AccountSecurityScreen: FC = () => {
  const helpViewer = useSecurityHelpViewer();
  const help = toScreenHelp(<AccountSecurityHelp viewer={helpViewer} />);

  return (
    <KkScreen
      kind="detail"
      title={SECURITY_TITLE}
      origin={PROFILE_ORIGIN}
      help={help}
      header={<KkTitleHeader title={SECURITY_TITLE} />}
      handover={AREA_HANDOVERS.profile}
    >
      <AccountSecurityBody />
    </KkScreen>
  );
};
