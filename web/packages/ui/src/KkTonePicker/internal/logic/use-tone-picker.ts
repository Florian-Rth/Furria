import { useState } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { isGroupTonePreset } from '../../../internal/group-tone';

export interface KkTonePickerControl {
  customTone: KkGroupTone | null;
  isFieldOpen: boolean;
  toggleField: () => void;
}

export const useTonePicker = (value: KkGroupTone | null): KkTonePickerControl => {
  const [isOpened, setIsOpened] = useState(false);
  const customTone = value !== null && !isGroupTonePreset(value) ? value : null;
  const isFieldOpen = isOpened || customTone !== null;

  const toggleField = (): void => {
    setIsOpened(!isFieldOpen);
  };

  return { customTone, isFieldOpen, toggleField };
};
