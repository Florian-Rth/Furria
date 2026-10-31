import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useLastSeen } from '@/lib/use-last-seen';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE } from '../group-hub-labels';
import { managedEntryOf } from '../managed-entry';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubEditorDenied } from './HubEditorDenied';
import { UsualTrainingTimeEditor } from './UsualTrainingTimeEditor';

const ROUTE_ID = '/_app/groups_/$groupId_/usual-training-times/$usualTrainingTimeId';
const TITLE = 'Trainingszeit ändern';

export const UsualTrainingTimeScreen: FC = () => {
  const { groupId, usualTrainingTimeId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const entryId = parsePositiveId(usualTrainingTimeId);
  const hub = useGroupHubQuery(id);
  const held = useLastSeen(
    hub.data,
    managedEntryOf(
      (data) =>
        data.usualTrainingTimes.find((entry) => entry.usualTrainingTimeId === entryId) ?? null,
    ),
  );

  if (held !== null) {
    return <UsualTrainingTimeEditor hub={held.source} usualTime={held.entry} />;
  }
  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  return <GroupEditorNotFound />;
};
