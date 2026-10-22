import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkInstallStage } from '@furria/ui/KkInstallStage';
import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { PROMPT_ACTION, PROMPT_HINT } from '../install-copy';

interface InstallPromptActionProps {
  onInstall: () => void;
}

const INSTALL_ICON = <KkIcon name="installApp" />;

export const InstallPromptAction: FC<InstallPromptActionProps> = ({ onInstall }) => (
  <KkInstallStage.Actions>
    <KkButton
      variant="contained"
      size="large"
      fullWidth
      startIcon={INSTALL_ICON}
      onClick={onInstall}
    >
      {PROMPT_ACTION}
    </KkButton>
    <KkNote>{PROMPT_HINT}</KkNote>
  </KkInstallStage.Actions>
);
