export const STUDIO_COMMANDS = [
  'toggle',
  'stepBack',
  'stepForward',
  'countBack',
  'countForward',
  'faster',
  'slower',
  'loop',
  'zoomIn',
  'zoomOut',
  'undo',
  'redo',
] as const;

export type StudioCommand = (typeof STUDIO_COMMANDS)[number];

export type StudioKeyActions = Partial<Record<StudioCommand, (() => void) | null>>;

export interface KeyFocus {
  typing: boolean;
  overlay: boolean;
  widget: boolean;
  control: boolean;
}

type FocusKind = keyof KeyFocus;

interface StudioKey {
  bindings: readonly string[];
  glyphs: readonly string[];
  repeats: boolean;
  blockedOn: readonly FocusKind[];
}

const ARROW_BLOCKS: readonly FocusKind[] = ['typing', 'overlay', 'widget'];

export const STUDIO_KEYS: Readonly<Record<StudioCommand, StudioKey>> = {
  toggle: {
    bindings: ['[Shift]+Space'],
    glyphs: ['Leertaste'],
    repeats: false,
    blockedOn: ['typing', 'overlay', 'control'],
  },
  stepBack: { bindings: ['ArrowLeft'], glyphs: ['←'], repeats: true, blockedOn: ARROW_BLOCKS },
  stepForward: { bindings: ['ArrowRight'], glyphs: ['→'], repeats: true, blockedOn: ARROW_BLOCKS },
  countBack: {
    bindings: ['Shift+ArrowLeft'],
    glyphs: ['⇧ ←'],
    repeats: true,
    blockedOn: ARROW_BLOCKS,
  },
  countForward: {
    bindings: ['Shift+ArrowRight'],
    glyphs: ['⇧ →'],
    repeats: true,
    blockedOn: ARROW_BLOCKS,
  },
  faster: { bindings: ['ArrowUp'], glyphs: ['↑'], repeats: true, blockedOn: ARROW_BLOCKS },
  slower: { bindings: ['ArrowDown'], glyphs: ['↓'], repeats: true, blockedOn: ARROW_BLOCKS },
  loop: {
    bindings: ['[Shift]+l'],
    glyphs: ['L'],
    repeats: false,
    blockedOn: ['typing', 'overlay'],
  },
  zoomIn: {
    bindings: ['[Shift]++', '[Shift]+='],
    glyphs: ['+'],
    repeats: true,
    blockedOn: ['typing', 'overlay'],
  },
  zoomOut: {
    bindings: ['[Shift]+-', '[Shift]+_'],
    glyphs: ['−'],
    repeats: true,
    blockedOn: ['typing', 'overlay'],
  },
  undo: {
    bindings: ['Control+z', 'Meta+z'],
    glyphs: ['Strg Z'],
    repeats: false,
    blockedOn: ['typing'],
  },
  redo: {
    bindings: ['Control+Shift+z', 'Meta+Shift+z', 'Control+y', 'Meta+y'],
    glyphs: ['Strg ⇧ Z'],
    repeats: false,
    blockedOn: ['typing'],
  },
};

export type KeyDecision = 'run' | 'swallow' | 'pass';

export const keyDecisionOf = (
  command: StudioCommand,
  focus: KeyFocus,
  repeat: boolean,
): KeyDecision => {
  const key = STUDIO_KEYS[command];
  if (key.blockedOn.some((kind) => focus[kind])) {
    return 'pass';
  }

  return repeat && !key.repeats ? 'swallow' : 'run';
};

export interface StudioKeyHelpGroup {
  id: string;
  commands: readonly StudioCommand[];
  action: string;
}

export interface StudioKeyHelpEntry {
  id: string;
  keys: readonly string[];
  action: string;
}

export const keyHelpOf = (groups: readonly StudioKeyHelpGroup[]): StudioKeyHelpEntry[] =>
  groups.map((group) => ({
    id: group.id,
    keys: group.commands.flatMap((command) => STUDIO_KEYS[command].glyphs),
    action: group.action,
  }));
