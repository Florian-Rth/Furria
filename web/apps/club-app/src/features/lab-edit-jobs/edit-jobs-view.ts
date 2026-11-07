import type { KkEjButtonTone } from '@furria/ui/KkEjButton';
import type { KkEjGlyphName } from '@furria/ui/KkEjGlyph';
import type { EjReason } from './edit-jobs';

export interface EjAction {
  key: string;
  text: string;
  glyph: KkEjGlyphName;
  tone: KkEjButtonTone;
  label: string | undefined;
  disabled: boolean;
  reason: EjReason | null;
  pressed: boolean | undefined;
  press: () => void;
}

export interface EjField {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  change: (value: string) => void;
  commit: () => void;
}

export interface EjChoice {
  key: string;
  text: string;
  label: string | undefined;
  current: boolean;
  disabled: boolean;
  reason: EjReason | null;
  press: () => void;
}

export interface EjListRow {
  key: string;
  lead: string;
  title: string;
  meta: string;
  badge: string | null;
  selected: boolean;
  label: string;
  press: () => void;
}

export interface EjCopyPick {
  previousLocked: boolean;
  nextLocked: boolean;
  previous: () => void;
  next: () => void;
  action: EjAction;
}

export interface EjCompass {
  point: number | null;
  choose: (point: number) => void;
  free: () => void;
}

export type EjSection =
  | { kind: 'tools'; key: string; title: string | null; aside: string | null; actions: EjAction[] }
  | { kind: 'fields'; key: string; title: string; fields: EjField[] }
  | { kind: 'choices'; key: string; title: string; aside: string | null; choices: EjChoice[] }
  | { kind: 'copy'; key: string; title: string; pick: EjCopyPick }
  | {
      kind: 'switch';
      key: string;
      title: string;
      label: string;
      checked: boolean;
      change: () => void;
    }
  | { kind: 'spots'; key: string; title: string; aside: string | null; rows: EjListRow[] }
  | { kind: 'compass'; key: string; title: string; aside: string; compass: EjCompass }
  | { kind: 'note'; key: string; text: string };

export interface EjBlock {
  key: string;
  owner: string;
  title: string;
  meta: string | null;
  sections: EjSection[];
  danger: EjAction | null;
}

export interface EjJobView {
  context: string;
  blocks: EjBlock[];
  bar: EjAction[];
}

interface EjActionOptions {
  tone?: KkEjButtonTone;
  label?: string;
  disabled?: boolean;
  reason?: EjReason | null;
  pressed?: boolean;
}

export const ejActionOf = (
  key: string,
  text: string,
  glyph: KkEjGlyphName,
  press: () => void,
  options: EjActionOptions = {},
): EjAction => ({
  key,
  text,
  glyph,
  press,
  tone: options.tone ?? 'quiet',
  label: options.label,
  disabled: options.disabled ?? (options.reason !== undefined && options.reason !== null),
  reason: options.reason ?? null,
  pressed: options.pressed,
});

export const partFirstOf = (view: EjJobView): EjJobView => ({
  ...view,
  blocks: [
    ...view.blocks.filter((block) => block.key.startsWith('part:')),
    ...view.blocks.filter((block) => !block.key.startsWith('part:')),
  ],
});

export const actionsIn = (view: EjJobView, keys: readonly string[]): EjAction[] => {
  const all = view.blocks.flatMap((block) => [
    ...block.sections.flatMap((section) => (section.kind === 'tools' ? section.actions : [])),
    ...(block.danger === null ? [] : [block.danger]),
  ]);

  return keys.flatMap((key) => all.filter((action) => action.key === key));
};

export type EjCompassSection = Extract<EjSection, { kind: 'compass' }>;

export const compassSectionOf = (view: EjJobView): EjCompassSection | null =>
  view.blocks
    .flatMap((block) => block.sections)
    .find((section): section is EjCompassSection => section.kind === 'compass') ?? null;
