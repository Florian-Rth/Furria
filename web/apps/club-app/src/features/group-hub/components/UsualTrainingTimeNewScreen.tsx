import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE } from '../group-hub-labels';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubEditorDenied } from './HubEditorDenied';
import { UsualTrainingTimeEditor } from './UsualTrainingTimeEditor';

const ROUTE_ID = '/_app/groups_/$groupId_/usual-training-times/new';
const TITLE = 'Trainingszeit hinzufügen';

export const UsualTrainingTimeNewScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  return <UsualTrainingTimeEditor hub={hub.data} usualTime={null} />;
};
