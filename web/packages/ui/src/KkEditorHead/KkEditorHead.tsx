import { KkEditorHeadName } from './internal/layout/KkEditorHeadName';
import { KkEditorHeadRoot } from './internal/layout/KkEditorHeadRoot';
import { KkEditorHeadStatus } from './internal/ui/KkEditorHeadStatus';
import { KkEditorHeadTitle } from './internal/ui/KkEditorHeadTitle';

export type { KkEditorHeadStatusTone } from './internal/ui/KkEditorHeadStatus';

export const KkEditorHead = Object.assign(KkEditorHeadRoot, {
  Name: KkEditorHeadName,
  Status: KkEditorHeadStatus,
  Title: KkEditorHeadTitle,
});
