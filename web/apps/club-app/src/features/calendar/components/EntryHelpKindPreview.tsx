import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import { CALENDAR_KIND_OPTIONS } from '../calendar-labels';

const FIELD_NAME = 'help-kind';
const KIND_LABEL = 'Art';
const SAMPLE_KIND = 'training';

const keep = (): void => {};

export const EntryHelpKindPreview: FC = () => (
  <KkSelectField
    name={FIELD_NAME}
    label={KIND_LABEL}
    value={SAMPLE_KIND}
    options={CALENDAR_KIND_OPTIONS}
    onChange={keep}
    presentation="choices"
  />
);
