import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '@/features/group-hub/api';
import { GroupEditorUnloaded } from '@/features/group-hub/components/GroupEditorUnloaded';
import { HubEditorDenied } from '@/features/group-hub/components/HubEditorDenied';
import { parsePositiveId } from '@/lib/positive-id';
import { GROUP_MATCHER_DENIED_MESSAGE, GROUP_MATCHER_TITLE } from '../group-matcher-labels';
import { GroupMatcherEditor } from './GroupMatcherEditor';

const ROUTE_ID = '/_app/groups_/$groupId_/group-matcher';

export const GroupMatcherScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return (
      <HubEditorDenied
        hub={hub.data}
        title={GROUP_MATCHER_TITLE}
        message={GROUP_MATCHER_DENIED_MESSAGE}
      />
    );
  }

  return <GroupMatcherEditor hub={hub.data} />;
};
