import type { KkAnswerChoiceLabels } from '@furria/ui/KkAnswerChoice';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import type { CalendarAttendanceChange, CalendarMarkablePerson } from './schemas';

export const MARKING_TITLE = 'Für andere eintragen';
export const MARKING_LIST_LABEL = 'Mitglieder';
export const MARKING_CLOSE_LABEL = 'Schließen';
export const MARKING_UNDO = 'Rückgängig';
export const MARKING_EMPTY = 'Deine Gruppen haben für dieses Training keine Mitglieder.';

export const MARKED_ANSWER_LABELS: KkAnswerChoiceLabels = {
  yes: 'Ja',
  maybe: 'Vielleicht',
  no: 'Nein',
};

const OPEN_NOTE = 'Noch offen';

export const toMarkingChoiceLabel = (name: string): string => `${name} eintragen`;

export const toMarkingUndoLabel = (name: string): string => `Eintrag für ${name} rückgängig machen`;

export const toMarkingCount = (people: readonly CalendarMarkablePerson[]): string =>
  `${people.filter((person) => person.answer !== null).length} von ${people.length}`;

const voiceOf = (change: CalendarAttendanceChange): string => {
  if (!change.isRecordedOnBehalf) {
    return 'selbst';
  }

  return change.recordedByFirstName === null ? 'eingetragen' : change.recordedByFirstName;
};

const stepOf = (change: CalendarAttendanceChange): string =>
  `${ATTENDANCE_LABELS[change.answer]} (${voiceOf(change)})`;

export const toMarkingNote = ({ answer, trail }: CalendarMarkablePerson): string => {
  const latest = trail[0];
  if (answer === null) {
    return OPEN_NOTE;
  }

  return latest === undefined ? ATTENDANCE_LABELS[answer] : stepOf(latest);
};

export const toMarkingTrail = ({ trail }: CalendarMarkablePerson): string | undefined =>
  trail.length < 2 ? undefined : `Vorher: ${trail.slice(1).map(stepOf).join(' · ')}`;
