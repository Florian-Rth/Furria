import { KkStudioToolsRoot } from './internal/layout/KkStudioToolsRoot';
import { KkStudioTool } from './internal/ui/KkStudioTool';

export type { KkStudioToolGlyph } from './internal/ui/studio-glyphs';

export const KkStudioTools = Object.assign(KkStudioToolsRoot, {
  Tool: KkStudioTool,
});
