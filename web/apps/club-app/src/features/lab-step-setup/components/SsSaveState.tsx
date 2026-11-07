import { StudioSaveButton } from '@furria/studio/StudioSaveButton';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { SS_SAVE_FAILED, SS_SAVING } from '../setup-copy';

interface SsSaveStateProps {
  history: VisitHistory;
}

export const SsSaveState: FC<SsSaveStateProps> = ({ history }) => {
  switch (history.status) {
    case 'saving':
      return (
        <KkMeta component="span" sx={{ flexShrink: 0 }}>
          {SS_SAVING}
        </KkMeta>
      );
    case 'failed':
      return (
        <>
          <KkMeta component="span" tone="accent" sx={{ flexShrink: 0 }}>
            {SS_SAVE_FAILED}
          </KkMeta>
          <StudioSaveButton history={history} textShown={false} />
        </>
      );
    default:
      return null;
  }
};
