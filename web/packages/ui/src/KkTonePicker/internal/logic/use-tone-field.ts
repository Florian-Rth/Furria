import { useState } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import type { KkHsv } from '../../../internal/tone-color';
import { hexOfHsv, hsvOfHex, toToneHex } from '../../../internal/tone-color';

const START_TONE = '#1F7565';

export interface KkToneFieldControl {
  hsv: KkHsv;
  draft: string;
  isDraftInvalid: boolean;
  pickHsv: (hsv: KkHsv) => void;
  pickHue: (hue: number) => void;
  typeDraft: (text: string) => void;
}

export const useToneField = (
  value: KkGroupTone | null,
  onChange: (tone: KkGroupTone) => void,
): KkToneFieldControl => {
  const [hsv, setHsv] = useState<KkHsv>(() => hsvOfHex(value ?? START_TONE));
  const [draft, setDraft] = useState(value ?? '');
  const [seenValue, setSeenValue] = useState(value);

  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== null && value !== hexOfHsv(hsv)) {
      setHsv(hsvOfHex(value));
    }
    if (value !== null && value !== toToneHex(draft)) {
      setDraft(value);
    }
  }

  const emit = (tone: KkGroupTone): void => {
    setSeenValue(tone);
    onChange(tone);
  };

  const pickHsv = (next: KkHsv): void => {
    const tone = hexOfHsv(next);
    setHsv(next);
    setDraft(tone);
    emit(tone);
  };

  const pickHue = (hue: number): void => {
    pickHsv({ ...hsv, h: hue });
  };

  const typeDraft = (text: string): void => {
    setDraft(text);
    const tone = toToneHex(text);
    if (tone !== null) {
      setHsv(hsvOfHex(tone));
      emit(tone);
    }
  };

  const isDraftInvalid = draft.trim() !== '' && toToneHex(draft) === null;

  return { hsv, draft, isDraftInvalid, pickHsv, pickHue, typeDraft };
};
