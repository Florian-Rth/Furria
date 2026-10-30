import { KkStudioHToolsRoot } from './internal/layout/KkStudioHToolsRoot';
import { KkStudioHTool } from './internal/ui/KkStudioHTool';

export type { KkStudioHToolGlyph } from './internal/ui/studio-h-glyphs';

export const KkStudioHTools = Object.assign(KkStudioHToolsRoot, {
  Tool: KkStudioHTool,
});
