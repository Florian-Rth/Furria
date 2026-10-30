import { KkStudioHSideMedia } from './internal/layout/KkStudioHSideMedia';
import { KkStudioHSideRest } from './internal/layout/KkStudioHSideRest';
import { KkStudioHSideRoot } from './internal/layout/KkStudioHSideRoot';

export const KkStudioHSide = Object.assign(KkStudioHSideRoot, {
  Media: KkStudioHSideMedia,
  Rest: KkStudioHSideRest,
});
