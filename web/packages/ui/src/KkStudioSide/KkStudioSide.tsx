import { KkStudioSideMedia } from './internal/layout/KkStudioSideMedia';
import { KkStudioSideRest } from './internal/layout/KkStudioSideRest';
import { KkStudioSideRoot } from './internal/layout/KkStudioSideRoot';

export const KkStudioSide = Object.assign(KkStudioSideRoot, {
  Media: KkStudioSideMedia,
  Rest: KkStudioSideRest,
});
