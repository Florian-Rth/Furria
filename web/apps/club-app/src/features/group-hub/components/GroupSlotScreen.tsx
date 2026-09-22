import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toEntryId, toHubId } from '../group-hub-labels';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { GroupSlotEditor } from './GroupSlotEditor';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/slots/$slotId';
const TITLE = 'Trainingszeit ändern';

export const GroupSlotScreen: FC = () => {
  const { groupId, slotId } = useParams({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const entryId = toEntryId(slotId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return hub.isLoading ? <GroupEditorSkeleton /> : <GroupEditorNotFound />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  const slot =
    entryId === null
      ? null
      : (hub.data.trainingSlots.find((entry) => entry.groupTrainingSlotId === entryId) ?? null);

  if (slot === null) {
    return <GroupEditorNotFound />;
  }

  return <GroupSlotEditor hub={hub.data} slot={slot} />;
};
