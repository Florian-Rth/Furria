import { KkChip } from '@furria/ui/KkChip';
import { KkRadioGroup } from '@furria/ui/KkRadioGroup';
import type { FC } from 'react';
import { CANDIDATE_CHOICE_LABEL, NEW_PERSON_LABEL, THIS_IS_HER_CHIP } from '../admission-labels';

const CHOICE_NAME = 'help-admission-person';
const CANDIDATE_VALUE = 'help-candidate';
const NEW_VALUE = 'help-new';
const CANDIDATE_NAME = 'Lea Hoffmann';
const CANDIDATE_DESCRIPTION = 'geb. 02.05.2010 · Furth · in Jugendgarde';
const NEW_DESCRIPTION = 'Lea wird neu im Register angelegt.';

const keep = (): void => {};

const THIS_IS_HER = (
  <KkChip tone={THIS_IS_HER_CHIP.tone} dot={THIS_IS_HER_CHIP.dot} size="small">
    {THIS_IS_HER_CHIP.label}
  </KkChip>
);

export const AdmissionHelpChoicePreview: FC = () => (
  <KkRadioGroup
    name={CHOICE_NAME}
    label={CANDIDATE_CHOICE_LABEL}
    value={CANDIDATE_VALUE}
    onChange={keep}
  >
    <KkRadioGroup.Option
      value={CANDIDATE_VALUE}
      label={CANDIDATE_NAME}
      description={CANDIDATE_DESCRIPTION}
      trailing={THIS_IS_HER}
    />
    <KkRadioGroup.Option value={NEW_VALUE} label={NEW_PERSON_LABEL} description={NEW_DESCRIPTION} />
  </KkRadioGroup>
);
