import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { toHubEditorOrigin } from '../group-hub-labels';
import type { GroupHub } from '../schemas';

interface HubEditorDeniedProps {
  hub: GroupHub;
  title: string;
  message: string;
}

export const HubEditorDenied: FC<HubEditorDeniedProps> = ({ hub, title, message }) => (
  <KkScreen kind="fullscreen" title={title} origin={toHubEditorOrigin(hub)}>
    <AccessDenied message={message} />
  </KkScreen>
);
