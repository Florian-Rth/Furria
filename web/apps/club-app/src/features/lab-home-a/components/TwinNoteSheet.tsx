import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkTwin } from '@furria/ui/KkTwin';
import type { FC } from 'react';
import type { TwinScreen } from '../hooks/use-twin-screen';
import { TWIN_NOTE_CLOSE } from '../twin-copy';

interface TwinNoteSheetProps {
  screen: TwinScreen;
}

export const TwinNoteSheet: FC<TwinNoteSheetProps> = ({ screen }) => {
  const { practice, note } = screen;

  return (
    <KkBottomDrawer
      open={note.reading}
      label={practice.stepName}
      closeLabel={TWIN_NOTE_CLOSE}
      onClose={note.close}
    >
      <KkTwin.Reading eyebrow={practice.partName} title={practice.stepName} text={note.text} />
    </KkBottomDrawer>
  );
};
