import { KkConsequenceNote } from '@furria/ui/KkConsequenceNote';
import { KkSelectField } from '@furria/ui/KkSelectField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AGE_OF_CONSENT_OPTIONS, toAgeConsequence } from '../club-record-labels';

const SAMPLE_AGE = '16';
const AGE_LABEL = 'Mindestalter für App und Online-Antrag';
const SAMPLE_CONSEQUENCE = toAgeConsequence(SAMPLE_AGE);

const keep = (): void => {};

export const ClubAccessHelpAgePreview: FC = () => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <KkSelectField
      name="help-age-of-consent"
      label={AGE_LABEL}
      value={SAMPLE_AGE}
      options={AGE_OF_CONSENT_OPTIONS}
      onChange={keep}
      presentation="select"
    />
    <KkConsequenceNote>{SAMPLE_CONSEQUENCE}</KkConsequenceNote>
  </Stack>
);
