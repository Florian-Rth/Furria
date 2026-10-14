import type { GroupHub } from './schemas';

export const managedEntryOf =
  <TEntry>(pick: (hub: GroupHub) => TEntry | null) =>
  (hub: GroupHub): TEntry | null =>
    hub.viewerMayManage ? pick(hub) : null;
