import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';

const TITLE_FALLBACK = 'Gruppenart';
const NOT_FOUND_TITLE = 'NICHT MEHR DA';
const NOT_FOUND_DESCRIPTION = 'Diese Gruppenart gibt es nicht mehr.';

export const ManageGroupsEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={TITLE_FALLBACK} origin={MANAGE_GROUPS_ORIGIN}>
    <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />
  </KkScreen>
);
