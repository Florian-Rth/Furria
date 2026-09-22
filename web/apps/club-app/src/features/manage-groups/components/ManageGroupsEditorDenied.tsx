import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';

const DENIED_MESSAGE =
  'Die Gruppenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.';

interface ManageGroupsEditorDeniedProps {
  title: string;
}

export const ManageGroupsEditorDenied: FC<ManageGroupsEditorDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={MANAGE_GROUPS_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);
