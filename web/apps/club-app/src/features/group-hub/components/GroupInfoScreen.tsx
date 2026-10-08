import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE } from '../group-hub-labels';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { GroupInfoEditor } from './GroupInfoEditor';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/edit';
const TITLE = 'Angaben zur Gruppe bearbeiten';

export const GroupInfoScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  return <GroupInfoEditor hub={hub.data} />;
};
