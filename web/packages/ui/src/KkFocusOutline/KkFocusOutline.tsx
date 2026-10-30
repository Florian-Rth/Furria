import { KkFocusOutlineRoot } from './internal/layout/KkFocusOutlineRoot';
import { KkFocusOutlineAction } from './internal/ui/KkFocusOutlineAction';
import { KkFocusOutlinePart } from './internal/ui/KkFocusOutlinePart';
import { KkFocusOutlineStep } from './internal/ui/KkFocusOutlineStep';

export type { KkFocusOutlineRename } from './internal/ui/KkFocusOutlineField';

export const KkFocusOutline = Object.assign(KkFocusOutlineRoot, {
  Part: KkFocusOutlinePart,
  Step: KkFocusOutlineStep,
  Action: KkFocusOutlineAction,
});
