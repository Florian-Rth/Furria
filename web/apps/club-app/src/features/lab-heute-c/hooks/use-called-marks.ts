import { useState } from 'react';
import { CalledMarksSchema } from '../schemas';

export interface CalledMarks {
  isCalled: (key: string) => boolean;
  toggle: (key: string) => void;
}

const storageKeyOf = (eventId: number): string => `furria.heute.called.${eventId}`;

const readMarks = (eventId: number): string[] => {
  try {
    const stored = window.localStorage.getItem(storageKeyOf(eventId));
    const parsed = CalledMarksSchema.safeParse(stored === null ? [] : JSON.parse(stored));

    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
};

const writeMarks = (eventId: number, marks: readonly string[]): void => {
  try {
    window.localStorage.setItem(storageKeyOf(eventId), JSON.stringify(marks));
  } catch {
    return;
  }
};

export const useCalledMarks = (eventId: number): CalledMarks => {
  const [marks, setMarks] = useState<string[]>(() => readMarks(eventId));

  return {
    isCalled: (key) => marks.includes(key),
    toggle: (key) => {
      const next = marks.includes(key) ? marks.filter((mark) => mark !== key) : [...marks, key];
      setMarks(next);
      writeMarks(eventId, next);
    },
  };
};
