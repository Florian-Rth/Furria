import { KkStudioGInspectorBody } from './internal/layout/KkStudioGInspectorBody';
import { KkStudioGInspectorFacts } from './internal/layout/KkStudioGInspectorFacts';
import { KkStudioGInspectorIdle } from './internal/layout/KkStudioGInspectorIdle';
import { KkStudioGInspectorRoot } from './internal/layout/KkStudioGInspectorRoot';
import { KkStudioGInspectorRow } from './internal/layout/KkStudioGInspectorRow';
import { KkStudioGInspectorSheet } from './internal/layout/KkStudioGInspectorSheet';
import { KkStudioGInspectorSlots } from './internal/layout/KkStudioGInspectorSlots';
import { KkStudioGInspectorAction } from './internal/ui/KkStudioGInspectorAction';
import { KkStudioGInspectorChanged } from './internal/ui/KkStudioGInspectorChanged';
import { KkStudioGInspectorEyebrow } from './internal/ui/KkStudioGInspectorEyebrow';
import { KkStudioGInspectorFact } from './internal/ui/KkStudioGInspectorFact';
import { KkStudioGInspectorHead } from './internal/ui/KkStudioGInspectorHead';
import { KkStudioGInspectorLater } from './internal/ui/KkStudioGInspectorLater';
import { KkStudioGInspectorNote } from './internal/ui/KkStudioGInspectorNote';
import { KkStudioGInspectorSlot } from './internal/ui/KkStudioGInspectorSlot';
import { KkStudioGInspectorThumb } from './internal/ui/KkStudioGInspectorThumb';

export type { KkStudioGActionGlyph } from './internal/ui/KkStudioGInspectorAction';
export type { KkStudioGFactTone } from './internal/ui/KkStudioGInspectorFact';
export type { KkStudioGInspectorKind } from './internal/ui/kk-studio-g-kind-glyphs';

export const KkStudioGInspector = Object.assign(KkStudioGInspectorRoot, {
  Idle: KkStudioGInspectorIdle,
  Sheet: KkStudioGInspectorSheet,
  Head: KkStudioGInspectorHead,
  Body: KkStudioGInspectorBody,
  Facts: KkStudioGInspectorFacts,
  Fact: KkStudioGInspectorFact,
  Note: KkStudioGInspectorNote,
  Row: KkStudioGInspectorRow,
  Action: KkStudioGInspectorAction,
  Eyebrow: KkStudioGInspectorEyebrow,
  Slots: KkStudioGInspectorSlots,
  Slot: KkStudioGInspectorSlot,
  Later: KkStudioGInspectorLater,
  Changed: KkStudioGInspectorChanged,
  Thumb: KkStudioGInspectorThumb,
});
