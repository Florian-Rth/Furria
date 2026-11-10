import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';

const RELOAD_LABEL = 'Gruppen neu laden';

interface CalendarGroupsReloadButtonProps {
  reload: CalendarEntryReload;
}

export const CalendarGroupsReloadButton: FC<CalendarGroupsReloadButtonProps> = ({ reload }) => (
  <KkButton
    variant="outlined"
    size="small"
    loading={reload.isRetrying}
    onClick={reload.retry}
    sx={{ alignSelf: 'flex-start' }}
  >
    {RELOAD_LABEL}
  </KkButton>
);
