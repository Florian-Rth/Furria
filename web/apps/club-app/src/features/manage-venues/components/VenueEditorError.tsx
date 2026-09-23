import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { VENUES_ORIGIN } from '../manage-venues-labels';
import { ManagedVenuesError } from './ManagedVenuesError';

interface VenueEditorErrorProps {
  message: string;
  onRetry: () => void;
}

export const VenueEditorError: FC<VenueEditorErrorProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={VENUES_ORIGIN.label} origin={VENUES_ORIGIN}>
    <ManagedVenuesError message={message} onRetry={onRetry} />
  </KkScreen>
);
