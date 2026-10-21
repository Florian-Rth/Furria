import { KkButton, KkIcon, KkInstallStage } from '@furria/ui';
import type { FC } from 'react';
import { useCopyLink } from '../hooks/use-copy-link';
import { COPY_LINK_ACTION, EXIT_ACTIONS, LINK_COPIED } from '../install-copy';
import type { InstallExit } from '../install-guide';

interface InstallEscapeActionsProps {
  exit: InstallExit;
  exitHref: string;
}

const EXIT_ICON = <KkIcon name="openInBrowser" />;
const COPY_ICON = <KkIcon name="copy" />;

export const InstallEscapeActions: FC<InstallEscapeActionsProps> = ({ exit, exitHref }) => {
  const { isCopied, copy } = useCopyLink();
  const copyLabel = isCopied ? LINK_COPIED : COPY_LINK_ACTION;

  return (
    <KkInstallStage.Actions>
      <KkButton variant="contained" size="large" fullWidth startIcon={EXIT_ICON} href={exitHref}>
        {EXIT_ACTIONS[exit]}
      </KkButton>
      <KkButton variant="outlined" fullWidth startIcon={COPY_ICON} onClick={copy}>
        {copyLabel}
      </KkButton>
    </KkInstallStage.Actions>
  );
};
