import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import type { PotFields } from '../hooks/use-pot-fields';
import { BeerFieldError } from './BeerFieldError';

interface BeerPotPersonFieldProps {
  label: string;
  fields: PotFields;
}

export const BeerPotPersonField: FC<BeerPotPersonFieldProps> = ({ label, fields }) => (
  <>
    <KkText variant="subtitle2">{label}</KkText>
    <PersonPicker
      selected={fields.person}
      onSelect={fields.choosePerson}
      onClear={fields.clearPerson}
    />
    <BeerFieldError message={fields.personError} />
  </>
);
