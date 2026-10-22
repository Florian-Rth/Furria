import type { KkGreetingBeat } from '@furria/ui/greeting-context';
import { KkCountHead } from '@furria/ui/KkCountHead';
import type { FC } from 'react';
import type { HeadSplit } from '../greeting/head-split';

const AGE_UNIT = 'Jahre';

interface StartCountProps {
  split: HeadSplit;
  beat: KkGreetingBeat;
  onPress?: () => void;
}

const spokenOf = (split: HeadSplit): string | undefined => {
  if (split.kind === 'age') {
    return `${split.numeral} ${AGE_UNIT}`;
  }
  if (split.kind === 'number') {
    return [split.kicker, split.numeral].filter((word) => word !== null).join(' ');
  }

  return undefined;
};

export const StartCount: FC<StartCountProps> = ({ split, beat, onPress }) => {
  const unit = split.kind === 'age' ? AGE_UNIT : undefined;
  const kicker = split.kicker ?? undefined;

  return (
    <KkCountHead.Count
      value={split.numeral}
      beat={beat}
      kicker={kicker}
      unit={unit}
      label={spokenOf(split)}
      onPress={onPress}
    />
  );
};
