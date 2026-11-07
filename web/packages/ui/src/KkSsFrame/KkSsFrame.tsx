import { KkSsFrameFoot } from './internal/layout/KkSsFrameFoot';
import { KkSsFrameHead } from './internal/layout/KkSsFrameHead';
import { KkSsFramePicture } from './internal/layout/KkSsFramePicture';
import { KkSsFrameRoot } from './internal/layout/KkSsFrameRoot';
import { KkSsFrameTask } from './internal/layout/KkSsFrameTask';
import { KkSsFrameTimeline } from './internal/layout/KkSsFrameTimeline';
import { KkSsFrameTransport } from './internal/layout/KkSsFrameTransport';

export type { KkSsFrameSlotName } from './internal/frame-slot';

export const KkSsFrame = Object.assign(KkSsFrameRoot, {
  Head: KkSsFrameHead,
  Picture: KkSsFramePicture,
  Timeline: KkSsFrameTimeline,
  Transport: KkSsFrameTransport,
  Task: KkSsFrameTask,
  Foot: KkSsFrameFoot,
});
