import { KkButton, KkHomeScreenHint, KkInstallStage } from '@furria/ui';
import type { FC } from 'react';
import { APP_LABEL, REOPEN_GUIDE_ACTION } from '../install-copy';

interface InstallDoneBodyProps {
  onReopenGuide: () => void;
}

export const InstallDoneBody: FC<InstallDoneBodyProps> = ({ onReopenGuide }) => (
  <>
    <KkHomeScreenHint appLabel={APP_LABEL} />
    <KkInstallStage.Actions>
      <KkButton variant="text" onClick={onReopenGuide}>
        {REOPEN_GUIDE_ACTION}
      </KkButton>
    </KkInstallStage.Actions>
  </>
);
