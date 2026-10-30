import { KkSheet } from '@furria/ui/KkSheet';
import { KkWayStep } from '@furria/ui/KkWayStep';
import type { FC } from 'react';
import { WAY_NOTE_SHEET_ID } from '../hooks/use-way-screen';
import { WAY_NOTE_CLOSE } from '../way-copy';

interface WayNoteSheetProps {
  title: string;
  eyebrow: string;
  text: string;
}

export const WayNoteSheet: FC<WayNoteSheetProps> = ({ title, eyebrow, text }) => (
  <KkSheet id={WAY_NOTE_SHEET_ID} title={title} closeLabel={WAY_NOTE_CLOSE}>
    <KkSheet.Body>
      <KkWayStep.Read eyebrow={eyebrow} text={text} />
    </KkSheet.Body>
  </KkSheet>
);
