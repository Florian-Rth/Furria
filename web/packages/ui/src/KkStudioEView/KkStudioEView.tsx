import { KkStudioEViewFoot } from './internal/layout/KkStudioEViewFoot';
import { KkStudioEViewHead } from './internal/layout/KkStudioEViewHead';
import { KkStudioEViewMiddle } from './internal/layout/KkStudioEViewMiddle';
import { KkStudioEViewNote } from './internal/layout/KkStudioEViewNote';
import { KkStudioEViewRoot } from './internal/layout/KkStudioEViewRoot';

export const KkStudioEView = Object.assign(KkStudioEViewRoot, {
  Head: KkStudioEViewHead,
  Middle: KkStudioEViewMiddle,
  Note: KkStudioEViewNote,
  Foot: KkStudioEViewFoot,
});
