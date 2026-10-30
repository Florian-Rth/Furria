import { KkStudioGDeskInspector } from './internal/layout/KkStudioGDeskInspector';
import { KkStudioGDeskRoot } from './internal/layout/KkStudioGDeskRoot';
import { KkStudioGDeskTimeline } from './internal/layout/KkStudioGDeskTimeline';
import { KkStudioGDeskTransport } from './internal/layout/KkStudioGDeskTransport';
import { KkStudioGDeskViewer } from './internal/layout/KkStudioGDeskViewer';

export const KkStudioGDesk = Object.assign(KkStudioGDeskRoot, {
  Viewer: KkStudioGDeskViewer,
  Transport: KkStudioGDeskTransport,
  Timeline: KkStudioGDeskTimeline,
  Inspector: KkStudioGDeskInspector,
});
