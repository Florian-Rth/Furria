import { KkStudioEVideoHead } from './internal/layout/KkStudioEVideoHead';
import { KkStudioEVideoRoot } from './internal/layout/KkStudioEVideoRoot';
import { KkStudioEVideoClose } from './internal/ui/KkStudioEVideoClose';
import { KkStudioEVideoMirror } from './internal/ui/KkStudioEVideoMirror';
import { KkStudioEVideoScreen } from './internal/ui/KkStudioEVideoScreen';
import { KkStudioEVideoTitle } from './internal/ui/KkStudioEVideoTitle';

export type { KkStudioEVideoSource } from './internal/ui/KkStudioEVideoScreen';

export const KkStudioEVideo = Object.assign(KkStudioEVideoRoot, {
  Head: KkStudioEVideoHead,
  Title: KkStudioEVideoTitle,
  Mirror: KkStudioEVideoMirror,
  Close: KkStudioEVideoClose,
  Screen: KkStudioEVideoScreen,
});
