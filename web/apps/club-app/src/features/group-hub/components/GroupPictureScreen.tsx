import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { toGroupTone } from '@/features/groups';
import { PictureEditor } from '@/features/pictures';
import { parsePositiveId } from '@/lib/positive-id';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toHubEditorOrigin } from '../group-hub-labels';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/picture';
const TITLE = 'Gruppenbild';

export const GroupPictureScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  const target = { kind: 'groupPicture', ownerId: hub.data.groupId } as const;
  const origin = toHubEditorOrigin(hub.data);
  const tone = toGroupTone(hub.data.groupId, hub.data.tone);

  return (
    <PictureEditor
      target={target}
      editing={hub.data.pictureEditing}
      origin={origin}
      alt={hub.data.name}
      placeholderLabel={hub.data.name}
      tone={tone}
      refresh={hub.refetch}
    />
  );
};
