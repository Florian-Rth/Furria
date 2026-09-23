import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';
import { ManagedGroupsError } from './ManagedGroupsError';

interface ManageGroupsEditorErrorProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export const ManageGroupsEditorError: FC<ManageGroupsEditorErrorProps> = ({
  title,
  message,
  onRetry,
}) => (
  <KkScreen kind="fullscreen" title={title} origin={MANAGE_GROUPS_ORIGIN}>
    <ManagedGroupsError message={message} onRetry={onRetry} />
  </KkScreen>
);
