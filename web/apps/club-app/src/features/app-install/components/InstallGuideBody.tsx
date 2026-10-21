import { KkButton, KkInstallStage } from '@furria/ui';
import type { FC } from 'react';
import { CONFIRM_DONE_ACTION } from '../install-copy';
import type { InstallGuide } from '../install-guide';
import { InstallEscapeActions } from './InstallEscapeActions';
import { InstallPromptAction } from './InstallPromptAction';
import { InstallSteps } from './InstallSteps';

interface InstallGuideBodyProps {
  guide: InstallGuide;
  exitHref: string | null;
  onInstall: () => void;
  onConfirmDone: () => void;
}

export const InstallGuideBody: FC<InstallGuideBodyProps> = ({
  guide,
  exitHref,
  onInstall,
  onConfirmDone,
}) => {
  if (guide.kind === 'prompt') {
    return <InstallPromptAction onInstall={onInstall} />;
  }

  if (guide.kind === 'escape') {
    const actions =
      exitHref === null ? null : <InstallEscapeActions exit={guide.exit} exitHref={exitHref} />;
    return (
      <>
        <InstallSteps steps={guide.steps} />
        {actions}
      </>
    );
  }

  return (
    <>
      <InstallSteps steps={guide.steps} />
      <KkInstallStage.Actions>
        <KkButton variant="outlined" fullWidth onClick={onConfirmDone}>
          {CONFIRM_DONE_ACTION}
        </KkButton>
      </KkInstallStage.Actions>
    </>
  );
};
