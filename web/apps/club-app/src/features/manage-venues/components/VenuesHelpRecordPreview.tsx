import type { OpeningSlot } from '@furria/api-client/opening-hours';
import type { FC } from 'react';
import { toOpeningHoursText } from '../manage-venues-labels';
import { VenueRecord } from './VenueRecord';

const SAMPLE_NAME = 'Bäckerei Sonnenschein';
const SAMPLE_ADDRESS = 'Hauptstraße 12, 12345 Musterstadt';
const SAMPLE_HINT = 'Eingang über den Hof';
const SAMPLE_SLOTS: readonly OpeningSlot[] = [
  { weekday: 'monday', opens: '07:00', closes: '18:00' },
  { weekday: 'tuesday', opens: '07:00', closes: '18:00' },
  { weekday: 'wednesday', opens: '07:00', closes: '18:00' },
  { weekday: 'thursday', opens: '07:00', closes: '18:00' },
  { weekday: 'friday', opens: '07:00', closes: '18:00' },
  { weekday: 'saturday', opens: '07:00', closes: '12:00' },
];
const SAMPLE_OPENING_HOURS = toOpeningHoursText(SAMPLE_SLOTS);

export const VenuesHelpRecordPreview: FC = () => (
  <VenueRecord
    name={SAMPLE_NAME}
    addressLine={SAMPLE_ADDRESS}
    hint={SAMPLE_HINT}
    openingHours={SAMPLE_OPENING_HOURS}
    note={null}
    dimmed={false}
  />
);
