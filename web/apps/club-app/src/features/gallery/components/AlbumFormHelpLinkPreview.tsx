import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';

const keep = (): void => {};

const SAMPLE_OPTIONS: readonly KkSelectOption[] = [
  { value: 'entry', label: 'Einem Termin' },
  { value: 'session', label: 'Einer Session' },
  { value: 'none', label: 'Nichts davon' },
];

export const AlbumFormHelpLinkPreview: FC = () => (
  <KkSelectField
    name="help-album-link"
    label="Gehört zu"
    value="entry"
    options={SAMPLE_OPTIONS}
    onChange={keep}
    presentation="choices"
  />
);
