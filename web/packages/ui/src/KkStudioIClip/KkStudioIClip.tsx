import { KkStudioIClipRoot } from './internal/layout/KkStudioIClipRoot';
import { KkStudioIClipScreen } from './internal/layout/KkStudioIClipScreen';
import { KkStudioIClipBadge } from './internal/ui/KkStudioIClipBadge';
import { KkStudioIClipCaption } from './internal/ui/KkStudioIClipCaption';

export const KkStudioIClip = Object.assign(KkStudioIClipRoot, {
  Screen: KkStudioIClipScreen,
  Badge: KkStudioIClipBadge,
  Caption: KkStudioIClipCaption,
});
