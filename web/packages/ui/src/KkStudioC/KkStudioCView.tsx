import { KkStudioCViewMain } from './internal/layout/KkStudioCViewMain';
import { KkStudioCViewRoot } from './internal/layout/KkStudioCViewRoot';
import { KkStudioCViewEmpty } from './internal/ui/KkStudioCViewEmpty';
import { KkStudioCViewInset } from './internal/ui/KkStudioCViewInset';

export const KkStudioCView = Object.assign(KkStudioCViewRoot, {
  Main: KkStudioCViewMain,
  Inset: KkStudioCViewInset,
  Empty: KkStudioCViewEmpty,
});
