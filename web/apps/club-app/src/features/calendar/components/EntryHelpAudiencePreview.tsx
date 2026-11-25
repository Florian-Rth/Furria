import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import { AUDIENCE_HINTS, toAudienceOptions } from '../calendar-labels';

const FIELD_NAME = 'help-audience';
const AUDIENCE_LABEL = 'Für wen';
const SAMPLE_AUDIENCE = 'groups';
const AUDIENCE_OPTIONS = toAudienceOptions(['club', 'groups', 'people']);

const keep = (): void => {};

export const EntryHelpAudiencePreview: FC = () => (
  <KkSelectField
    name={FIELD_NAME}
    label={AUDIENCE_LABEL}
    value={SAMPLE_AUDIENCE}
    options={AUDIENCE_OPTIONS}
    onChange={keep}
    presentation="choices"
    hint={AUDIENCE_HINTS.groups}
  />
);
