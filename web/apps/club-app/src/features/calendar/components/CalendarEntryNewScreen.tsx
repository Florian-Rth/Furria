import type { FC } from 'react';
import { useCalendarAuthoring } from '../hooks/use-calendar-authoring';
import { CalendarEntryDenied } from './CalendarEntryDenied';
import { CalendarEntryEditor } from './CalendarEntryEditor';
import { CalendarEntryEditorSkeleton } from './CalendarEntryEditorSkeleton';

const TITLE = 'Termin hinzufügen';
const DENIED_MESSAGE =
  'Nur wer den Kalender des Vereins oder eine eigene Gruppe verwaltet, darf einen Termin eintragen.';

export const CalendarEntryNewScreen: FC = () => {
  const authoring = useCalendarAuthoring();

  if (authoring.isLoading) {
    return <CalendarEntryEditorSkeleton />;
  }
  if (!authoring.mayAuthor) {
    return <CalendarEntryDenied title={TITLE} message={DENIED_MESSAGE} />;
  }

  return (
    <CalendarEntryEditor
      entry={null}
      ownerOptions={authoring.ownerOptions}
      clubGroups={authoring.clubGroups}
      venues={authoring.venues}
    />
  );
};
