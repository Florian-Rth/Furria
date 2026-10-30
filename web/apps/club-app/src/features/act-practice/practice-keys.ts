export type PracticeCommand = 'toggle' | 'back' | 'forward' | 'faster' | 'slower' | 'loop';

export type KeyFocus = 'none' | 'text' | 'slider' | 'control';

export interface PracticeKeyPress {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  focus: KeyFocus;
}

const COMMANDS: Readonly<Record<string, PracticeCommand>> = {
  ' ': 'toggle',
  ArrowLeft: 'back',
  ArrowRight: 'forward',
  ArrowUp: 'faster',
  ArrowDown: 'slower',
  l: 'loop',
  L: 'loop',
};

const ARROWS: readonly PracticeCommand[] = ['back', 'forward', 'faster', 'slower'];

const RATE_TOLERANCE = 1e-6;

export const practiceCommandOf = (press: PracticeKeyPress): PracticeCommand | null => {
  if (press.ctrlKey || press.metaKey || press.altKey || press.focus === 'text') {
    return null;
  }

  const command = COMMANDS[press.key] ?? null;
  if (command === null) {
    return null;
  }
  if (press.focus === 'slider' && ARROWS.includes(command)) {
    return null;
  }

  return press.focus === 'control' && command === 'toggle' ? null : command;
};

export const steppedRateOf = (
  rates: readonly number[],
  rate: number,
  command: 'faster' | 'slower',
): number => {
  const ascending = [...rates].sort((left, right) => left - right);

  if (command === 'faster') {
    return (
      ascending.find((candidate) => candidate > rate + RATE_TOLERANCE) ?? ascending.at(-1) ?? rate
    );
  }

  return (
    ascending.findLast((candidate) => candidate < rate - RATE_TOLERANCE) ?? ascending[0] ?? rate
  );
};
