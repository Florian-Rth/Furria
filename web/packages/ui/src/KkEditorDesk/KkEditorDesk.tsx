import { KkEditorDeskArea } from './internal/layout/KkEditorDeskArea';
import { KkEditorDeskRoot } from './internal/layout/KkEditorDeskRoot';

export type { KkEditorDeskAreaName } from './internal/layout/KkEditorDeskArea';
export type { KkEditorDeskFit } from './internal/layout/KkEditorDeskRoot';

export const KkEditorDesk = Object.assign(KkEditorDeskRoot, {
  Area: KkEditorDeskArea,
});
