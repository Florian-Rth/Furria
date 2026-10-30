import { KkStudioHToolbarRoot } from './internal/layout/KkStudioHToolbarRoot';
import { KkStudioHToolbarSelection } from './internal/ui/KkStudioHToolbarSelection';
import { KkStudioHToolbarToggle } from './internal/ui/KkStudioHToolbarToggle';

export type { KkStudioHToolbarGlyph } from './internal/ui/KkStudioHToolbarToggle';

export const KkStudioHToolbar = Object.assign(KkStudioHToolbarRoot, {
  Toggle: KkStudioHToolbarToggle,
  Selection: KkStudioHToolbarSelection,
});
