import { KkEditorStageBleed } from './internal/layout/KkEditorStageBleed';
import { KkEditorStageRoot } from './internal/layout/KkEditorStageRoot';

export const KkEditorStage = Object.assign(KkEditorStageRoot, {
  Bleed: KkEditorStageBleed,
});
