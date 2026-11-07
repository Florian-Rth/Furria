import type { JobReason } from '@furria/studio/job-model';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';
import type { KkPillButtonTone } from '@furria/ui/KkPillButton';

export interface JobAction {
  key: string;
  text: string;
  glyph: KkLaneGlyphName;
  tone: KkPillButtonTone;
  label: string | undefined;
  disabled: boolean;
  reason: JobReason | null;
  pressed: boolean | undefined;
  press: () => void;
}

export interface JobField {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  change: (value: string) => void;
  commit: () => void;
}

export interface JobChoice {
  key: string;
  text: string;
  label: string | undefined;
  current: boolean;
  disabled: boolean;
  reason: JobReason | null;
  press: () => void;
}

export interface JobListRow {
  key: string;
  lead: string;
  title: string;
  meta: string;
  badge: string | null;
  selected: boolean;
  label: string;
  press: () => void;
}

export interface JobCopyPick {
  previousLocked: boolean;
  nextLocked: boolean;
  previous: () => void;
  next: () => void;
  action: JobAction;
}

export interface JobCompass {
  point: number | null;
  choose: (point: number) => void;
  free: () => void;
}

export type JobSection =
  | { kind: 'tools'; key: string; title: string | null; aside: string | null; actions: JobAction[] }
  | { kind: 'fields'; key: string; title: string; fields: JobField[] }
  | { kind: 'choices'; key: string; title: string; aside: string | null; choices: JobChoice[] }
  | { kind: 'copy'; key: string; title: string; pick: JobCopyPick }
  | {
      kind: 'switch';
      key: string;
      title: string;
      label: string;
      checked: boolean;
      change: () => void;
    }
  | { kind: 'spots'; key: string; title: string; aside: string | null; rows: JobListRow[] }
  | { kind: 'compass'; key: string; title: string; aside: string; compass: JobCompass }
  | { kind: 'note'; key: string; text: string };

export interface JobBlock {
  key: string;
  owner: string;
  title: string;
  meta: string | null;
  sections: JobSection[];
  danger: JobAction | null;
}

export interface JobView {
  context: string;
  blocks: JobBlock[];
  bar: JobAction[];
}

interface JobActionOptions {
  tone?: KkPillButtonTone;
  label?: string;
  disabled?: boolean;
  reason?: JobReason | null;
  pressed?: boolean;
}

export const jobActionOf = (
  key: string,
  text: string,
  glyph: KkLaneGlyphName,
  press: () => void,
  options: JobActionOptions = {},
): JobAction => ({
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

export const partFirstOf = (view: JobView): JobView => ({
  ...view,
  blocks: [
    ...view.blocks.filter((block) => block.key.startsWith('part:')),
    ...view.blocks.filter((block) => !block.key.startsWith('part:')),
  ],
});

export const actionsIn = (view: JobView, keys: readonly string[]): JobAction[] => {
  const all = view.blocks.flatMap((block) => [
    ...block.sections.flatMap((section) => (section.kind === 'tools' ? section.actions : [])),
    ...(block.danger === null ? [] : [block.danger]),
  ]);

  return keys.flatMap((key) => all.filter((action) => action.key === key));
};

export type JobCompassSection = Extract<JobSection, { kind: 'compass' }>;

export const compassSectionOf = (view: JobView): JobCompassSection | null =>
  view.blocks
    .flatMap((block) => block.sections)
    .find((section): section is JobCompassSection => section.kind === 'compass') ?? null;
