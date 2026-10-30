import type {
  KkStudioGActionGlyph,
  KkStudioGFactTone,
  KkStudioGInspectorKind,
} from '@furria/ui/KkStudioGInspector';

export interface InspectorFact {
  key: string;
  label: string;
  value: string;
  tone: KkStudioGFactTone;
}

export interface InspectorAction {
  key: string;
  glyph: KkStudioGActionGlyph;
  text: string;
  label?: string;
  pressed?: boolean;
  press: () => void;
}

export interface InspectorModel {
  key: string;
  kind: KkStudioGInspectorKind;
  eyebrow: string;
  title: string;
  note: string | null;
  hint: string | null;
  poster: string | null;
  facts: InspectorFact[];
  actions: InspectorAction[];
  slots: readonly string[];
  changed: boolean;
}

export const factOf = (
  key: string,
  label: string,
  value: string,
  tone: KkStudioGFactTone = 'plain',
): InspectorFact => ({ key, label, value, tone });
