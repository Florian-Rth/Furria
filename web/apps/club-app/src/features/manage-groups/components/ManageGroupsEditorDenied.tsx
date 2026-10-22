import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';

const DENIED_MESSAGE = 'Dir fehlt die Berechtigung für die Gruppenverwaltung.';

interface ManageGroupsEditorDeniedProps {
  title: string;
}

export const ManageGroupsEditorDenied: FC<ManageGroupsEditorDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={MANAGE_GROUPS_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);
