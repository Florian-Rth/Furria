import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { useGroupHubQuery } from '../api';
import { toEntryId, toHubId } from '../group-hub-labels';
import { toHubPeople } from '../hub-people';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubPersonPage } from './HubPersonPage';

const ROUTE_ID = '/_app/groups_/$groupId_/people/$personId';

export const HubPersonScreen: FC = () => {
  const { groupId, personId } = useParams({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const person = toEntryId(personId);
  const hub = useGroupHubQuery(id);
  const { isUndecided } = usePermissions();

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }

  const people = toHubPeople(hub.data.members, hub.data.admins);
  const exists = person !== null && people.some((entry) => entry.personId === person);

  if (!exists || person === null) {
    return <GroupEditorNotFound />;
  }
  if (isUndecided) {
    return <GroupEditorSkeleton />;
  }

  return <HubPersonPage hub={hub.data} personId={person} />;
};
