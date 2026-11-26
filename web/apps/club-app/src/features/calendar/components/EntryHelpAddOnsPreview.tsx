import { KkPanel } from '@furria/ui/KkPanel';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import type { CalendarAddOnKind } from '../schemas';

const SHOWN_ADD_ONS: readonly CalendarAddOnKind[] = ['attendance', 'poll', 'signUpList'];

const keep = (): void => {};

export const EntryHelpAddOnsPreview: FC = () => {
  const rows = SHOWN_ADD_ONS.map((addOn) => (
    <KkSelectRow key={addOn} title={CALENDAR_ADD_ON_LABELS[addOn]} onClick={keep} />
  ));

  return <KkPanel variant="list">{rows}</KkPanel>;
};
