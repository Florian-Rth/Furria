import { KkWorkQueueRoot } from './internal/layout/KkWorkQueueRoot';
import { KkWorkQueueAction } from './internal/ui/KkWorkQueueAction';
import { KkWorkQueueRow } from './internal/ui/KkWorkQueueRow';

export const KkWorkQueue = Object.assign(KkWorkQueueRoot, {
  Row: KkWorkQueueRow,
  Action: KkWorkQueueAction,
});
