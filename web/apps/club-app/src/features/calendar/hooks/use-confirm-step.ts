import { useState } from 'react';

export interface ConfirmStepControl {
  isAsked: boolean;
  ask: () => void;
  confirm: () => void;
  cancel: () => void;
}

export const useConfirmStep = (onConfirm: () => void): ConfirmStepControl => {
  const [isAsked, setAsked] = useState(false);

  return {
    isAsked,
    ask: () => {
      setAsked(true);
    },
    confirm: () => {
      setAsked(false);
      onConfirm();
    },
    cancel: () => {
      setAsked(false);
    },
  };
};
