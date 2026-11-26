import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { NOTIFY_LABEL } from '../calendar-labels';

const SAMPLE_REACH = 'Push an 12 Personen';

const keep = (): void => {};

export const EntryHelpNotifyPreview: FC = () => (
  <KkSwitchRow
    label={NOTIFY_LABEL}
    description={SAMPLE_REACH}
    checked
    onChange={keep}
    stateChip={false}
  />
);
