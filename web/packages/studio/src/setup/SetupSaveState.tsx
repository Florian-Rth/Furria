import { StudioSaveButton } from '@furria/studio/StudioSaveButton';
import { SETUP_SAVE_FAILED, SETUP_SAVING } from '@furria/studio/step-setup-copy';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';

interface SetupSaveStateProps {
  history: VisitHistory;
}

export const SetupSaveState: FC<SetupSaveStateProps> = ({ history }) => {
  switch (history.status) {
    case 'saving':
      return (
        <KkMeta component="span" sx={{ flexShrink: 0 }}>
          {SETUP_SAVING}
        </KkMeta>
      );
    case 'failed':
      return (
        <>
          <KkMeta component="span" tone="accent" sx={{ flexShrink: 0 }}>
            {SETUP_SAVE_FAILED}
          </KkMeta>
          <StudioSaveButton history={history} textShown={false} />
        </>
      );
    default:
      return null;
  }
};
