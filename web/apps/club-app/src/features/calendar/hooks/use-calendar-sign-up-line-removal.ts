import { useState } from 'react';
import { useSignUpLineRemovalMutation } from '../api';
import { toLineRemovalQuestion } from '../calendar-labels';

export interface CalendarSignUpLineRemoval {
  lineId: number;
  name: string;
}

export interface CalendarSignUpLineRemovalControl {
  removal: CalendarSignUpLineRemoval | null;
  question: string;
  isRemoving: boolean;
  ask: (removal: CalendarSignUpLineRemoval) => void;
  confirm: () => void;
  cancel: () => void;
}

const NO_QUESTION = '';

export const useCalendarSignUpLineRemoval = (): CalendarSignUpLineRemovalControl => {
  const removing = useSignUpLineRemovalMutation();
  const [removal, setRemoval] = useState<CalendarSignUpLineRemoval | null>(null);

  return {
    removal,
    question: removal === null ? NO_QUESTION : toLineRemovalQuestion(removal.name),
    isRemoving: removing.isPending,
    ask: setRemoval,
    confirm: () => {
      if (removal === null) {
        return;
      }

      setRemoval(null);
      removing.mutate({ lineId: removal.lineId });
    },
    cancel: () => {
      setRemoval(null);
    },
  };
};
