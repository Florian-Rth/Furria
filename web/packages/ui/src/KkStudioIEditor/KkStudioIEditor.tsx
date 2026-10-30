import { KkStudioIEditorControls } from './internal/layout/KkStudioIEditorControls';
import { KkStudioIEditorCounts } from './internal/layout/KkStudioIEditorCounts';
import { KkStudioIEditorFrame } from './internal/layout/KkStudioIEditorFrame';
import { KkStudioIEditorHead } from './internal/layout/KkStudioIEditorHead';
import { KkStudioIEditorRail } from './internal/layout/KkStudioIEditorRail';
import { KkStudioIEditorRoot } from './internal/layout/KkStudioIEditorRoot';
import { KkStudioIEditorSide } from './internal/layout/KkStudioIEditorSide';
import { KkStudioIEditorWave } from './internal/layout/KkStudioIEditorWave';

export const KkStudioIEditor = Object.assign(KkStudioIEditorRoot, {
  Head: KkStudioIEditorHead,
  Rail: KkStudioIEditorRail,
  Wave: KkStudioIEditorWave,
  Frame: KkStudioIEditorFrame,
  Counts: KkStudioIEditorCounts,
  Controls: KkStudioIEditorControls,
  Side: KkStudioIEditorSide,
});
