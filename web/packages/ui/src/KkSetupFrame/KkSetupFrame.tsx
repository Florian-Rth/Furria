import { KkSetupFrameFoot } from './internal/layout/KkSetupFrameFoot';
import { KkSetupFrameHead } from './internal/layout/KkSetupFrameHead';
import { KkSetupFramePicture } from './internal/layout/KkSetupFramePicture';
import { KkSetupFrameRoot } from './internal/layout/KkSetupFrameRoot';
import { KkSetupFrameTask } from './internal/layout/KkSetupFrameTask';
import { KkSetupFrameTimeline } from './internal/layout/KkSetupFrameTimeline';
import { KkSetupFrameTransport } from './internal/layout/KkSetupFrameTransport';

export type { KkSetupFrameSlotName } from './internal/frame-slot';

export const KkSetupFrame = Object.assign(KkSetupFrameRoot, {
  Head: KkSetupFrameHead,
  Picture: KkSetupFramePicture,
  Timeline: KkSetupFrameTimeline,
  Transport: KkSetupFrameTransport,
  Task: KkSetupFrameTask,
  Foot: KkSetupFrameFoot,
});
