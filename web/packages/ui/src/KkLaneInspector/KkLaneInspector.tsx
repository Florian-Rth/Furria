import { KkLaneInspectorActions } from './internal/layout/KkLaneInspectorActions';
import { KkLaneInspectorRoot } from './internal/layout/KkLaneInspectorRoot';
import { KkLaneInspectorFacts } from './internal/ui/KkLaneInspectorFacts';
import { KkLaneInspectorField } from './internal/ui/KkLaneInspectorField';
import { KkLaneInspectorHead } from './internal/ui/KkLaneInspectorHead';
import { KkLaneInspectorLog } from './internal/ui/KkLaneInspectorLog';
import { KkLaneInspectorNote } from './internal/ui/KkLaneInspectorNote';
import { KkLaneInspectorSection } from './internal/ui/KkLaneInspectorSection';
import { KkLaneInspectorTabs } from './internal/ui/KkLaneInspectorTabs';

export type { KkLaneInspectorFact } from './internal/ui/KkLaneInspectorFacts';
export type { KkLaneInspectorLogRow } from './internal/ui/KkLaneInspectorLog';
export type { KkLaneInspectorTab } from './internal/ui/KkLaneInspectorTabs';

export const KkLaneInspector = Object.assign(KkLaneInspectorRoot, {
  Actions: KkLaneInspectorActions,
  Facts: KkLaneInspectorFacts,
  Field: KkLaneInspectorField,
  Head: KkLaneInspectorHead,
  Log: KkLaneInspectorLog,
  Note: KkLaneInspectorNote,
  Section: KkLaneInspectorSection,
  Tabs: KkLaneInspectorTabs,
});
