import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { VENUES_ORIGIN } from '../manage-venues-labels';
import { VenueEditor } from './VenueEditor';
import { VenueEditorDenied } from './VenueEditorDenied';

const TITLE = 'Ort hinzufügen';

export const VenueNewScreen: FC = () => {
  const permissions = usePermissions();

  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.clubManage)) {
    return <VenueEditorDenied title={TITLE} origin={VENUES_ORIGIN} />;
  }

  return <VenueEditor venue={null} />;
};
