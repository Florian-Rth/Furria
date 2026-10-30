import { KkStudioDeskControls } from './internal/layout/KkStudioDeskControls';
import { KkStudioDeskLine } from './internal/layout/KkStudioDeskLine';
import { KkStudioDeskRoot } from './internal/layout/KkStudioDeskRoot';
import { KkStudioDeskNudge } from './internal/ui/KkStudioDeskNudge';
import { KkStudioDeskTitle } from './internal/ui/KkStudioDeskTitle';
import { KkStudioDeskValue } from './internal/ui/KkStudioDeskValue';

export const KkStudioDesk = Object.assign(KkStudioDeskRoot, {
  Line: KkStudioDeskLine,
  Title: KkStudioDeskTitle,
  Controls: KkStudioDeskControls,
  Nudge: KkStudioDeskNudge,
  Value: KkStudioDeskValue,
});
