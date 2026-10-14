import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useLastSeen } from '@/lib/use-last-seen';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE } from '../group-hub-labels';
import { managedEntryOf } from '../managed-entry';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { GroupSlotEditor } from './GroupSlotEditor';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/slots/$slotId';
const TITLE = 'Trainingszeit ändern';

export const GroupSlotScreen: FC = () => {
  const { groupId, slotId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const entryId = parsePositiveId(slotId);
  const hub = useGroupHubQuery(id);
  const held = useLastSeen(
    hub.data,
    managedEntryOf(
      (data) => data.trainingSlots.find((entry) => entry.groupTrainingSlotId === entryId) ?? null,
    ),
  );

  if (held !== null) {
    return <GroupSlotEditor hub={held.source} slot={held.entry} />;
  }
  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  return <GroupEditorNotFound />;
};
