import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import { useState } from 'react';
import { useAttendanceMarks } from '../api';
import type { AttendanceMarkTarget, MarkedAnswer } from '../calendar-marking';
import { isMarkedAnswer } from '../calendar-marking';
import {
  toMarkingChoiceLabel,
  toMarkingCount,
  toMarkingNote,
  toMarkingTrail,
  toMarkingUndoLabel,
} from '../calendar-marking-copy';
import type { CalendarEntry, CalendarMarkablePerson } from '../schemas';

export interface CalendarMarkingUndo {
  label: string;
  run: () => void;
}

export interface CalendarMarkingRow {
  personId: number;
  name: string;
  note: string;
  trail: string | undefined;
  choiceLabel: string;
  value: MarkedAnswer | null;
  choose: (answer: KkAnswer) => void;
  undo: CalendarMarkingUndo | null;
}

export interface CalendarMarkingControl {
  isAvailable: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  count: string;
  rows: CalendarMarkingRow[];
}

type SheetMarks = Readonly<Record<number, number>>;

const NOBODY: readonly CalendarMarkablePerson[] = [];
const NO_SHEET_MARKS: SheetMarks = {};

const markedValueOf = (person: CalendarMarkablePerson): MarkedAnswer | null =>
  person.answer !== null && isMarkedAnswer(person.answer) ? person.answer : null;

const withSheetMark = (marks: SheetMarks, personId: number, change: number): SheetMarks => ({
  ...marks,
  [personId]: Math.max(0, (marks[personId] ?? 0) + change),
});

export const useCalendarMarking = (entry: CalendarEntry): CalendarMarkingControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetMarks, setSheetMarks] = useState<SheetMarks>(NO_SHEET_MARKS);
  const marks = useAttendanceMarks(entry.calendarEntryId);
  const markable = entry.attendance?.markable ?? null;
  const people = markable ?? NOBODY;
  const target = (personId: number): AttendanceMarkTarget => ({
    calendarEntryId: entry.calendarEntryId,
    personId,
  });

  const undoOf = (person: CalendarMarkablePerson, name: string): CalendarMarkingUndo | null =>
    (sheetMarks[person.personId] ?? 0) === 0
      ? null
      : {
          label: toMarkingUndoLabel(name),
          run: () => {
            setSheetMarks((current) => withSheetMark(current, person.personId, -1));
            marks.withdraw.mutate(target(person.personId));
          },
        };

  const rowOf = (person: CalendarMarkablePerson): CalendarMarkingRow => {
    const name = `${person.firstName} ${person.lastName}`;

    return {
      personId: person.personId,
      name,
      note: toMarkingNote(person),
      trail: toMarkingTrail(person),
      choiceLabel: toMarkingChoiceLabel(name),
      value: markedValueOf(person),
      choose: (answer) => {
        if (!isMarkedAnswer(answer)) {
          return;
        }

        setSheetMarks((current) => withSheetMark(current, person.personId, 1));
        marks.mark.mutate({ ...target(person.personId), answer });
      },
      undo: undoOf(person, name),
    };
  };

  return {
    isAvailable: markable !== null,
    isOpen,
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      setSheetMarks(NO_SHEET_MARKS);
    },
    count: toMarkingCount(people),
    rows: people.map(rowOf),
  };
};
