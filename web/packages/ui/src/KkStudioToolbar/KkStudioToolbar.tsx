import { KkStudioToolbarRoot } from './internal/layout/KkStudioToolbarRoot';
import { KkStudioToolbarSelection } from './internal/ui/KkStudioToolbarSelection';
import { KkStudioToolbarToggle } from './internal/ui/KkStudioToolbarToggle';

export type { KkStudioToolbarGlyph } from './internal/ui/KkStudioToolbarToggle';

export const KkStudioToolbar = Object.assign(KkStudioToolbarRoot, {
  Toggle: KkStudioToolbarToggle,
  Selection: KkStudioToolbarSelection,
});
