import { useState } from 'react';

export interface AnswerExpansion {
  expandedId: number | null;
  toggle: (calendarEntryId: number) => void;
  collapse: (calendarEntryId: number) => void;
}

export const useAnswerExpansion = (): AnswerExpansion => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (calendarEntryId: number): void => {
    setExpandedId((current) => (current === calendarEntryId ? null : calendarEntryId));
  };

  const collapse = (calendarEntryId: number): void => {
    setExpandedId((current) => (current === calendarEntryId ? null : current));
  };

  return { expandedId, toggle, collapse };
};
