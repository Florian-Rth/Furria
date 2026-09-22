import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { VENUE_EDITOR_DENIED_MESSAGE } from '../manage-venues-labels';

interface VenueEditorDeniedProps {
  title: string;
  origin: KkScreenOrigin;
}

export const VenueEditorDenied: FC<VenueEditorDeniedProps> = ({ title, origin }) => (
  <KkScreen kind="fullscreen" title={title} origin={origin}>
    <AccessDenied message={VENUE_EDITOR_DENIED_MESSAGE} />
  </KkScreen>
);
