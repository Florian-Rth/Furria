import type { KkSheetAction } from '@furria/ui/sheet-actions';
import { Link } from '@tanstack/react-router';

const EDIT_LABEL = 'Bearbeiten';
const EVENT_ROUTE = '/events/$eventId';

export const toEventEditAction = (eventId: number): KkSheetAction => ({
  label: EDIT_LABEL,
  component: Link,
  to: EVENT_ROUTE,
  params: { eventId: String(eventId) },
});
