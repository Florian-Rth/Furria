import { KkEmptyState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import {
  VENUE_NOT_FOUND_DESCRIPTION,
  VENUE_NOT_FOUND_TITLE,
  VENUES_ORIGIN,
} from '../manage-venues-labels';

export const VenueEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={VENUES_ORIGIN.label} origin={VENUES_ORIGIN}>
    <KkEmptyState title={VENUE_NOT_FOUND_TITLE} description={VENUE_NOT_FOUND_DESCRIPTION} />
  </KkScreen>
);
