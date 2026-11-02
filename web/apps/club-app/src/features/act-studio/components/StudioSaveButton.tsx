import type { SaveStatus } from '@furria/studio/autosave';
import type { KkLaneButtonTone } from '@furria/ui/KkLaneButton';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';
import type { FC } from 'react';
import { SAVE_STATUS_SHORT, SAVE_STATUS_TEXT } from '../document-copy';
import type { VisitHistory } from '../hooks/use-visit-history';

interface StudioSaveButtonProps {
  history: VisitHistory;
  textShown?: boolean;
}

const STATUS_GLYPH: Record<SaveStatus, KkLaneGlyphName> = {
  saved: 'check',
  saving: 'history',
  failed: 'redo',
};

const STATUS_TONE: Record<SaveStatus, KkLaneButtonTone> = {
  saved: 'quiet',
  saving: 'quiet',
  failed: 'danger',
};

export const StudioSaveButton: FC<StudioSaveButtonProps> = ({ history, textShown = true }) => {
  if (history.status === null) {
    return null;
  }

  const settled = history.status !== 'failed';

  return (
    <KkLaneButton
      text={SAVE_STATUS_SHORT[history.status]}
      label={SAVE_STATUS_TEXT[history.status]}
      glyph={STATUS_GLYPH[history.status]}
      tone={STATUS_TONE[history.status]}
      textShown={textShown}
      disabled={settled}
      onPress={history.retry}
    />
  );
};
