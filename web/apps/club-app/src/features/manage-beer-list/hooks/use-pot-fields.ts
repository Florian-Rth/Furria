import type { ChangeEvent } from 'react';
import type { Control } from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { PersonRef } from '@/lib/api/schemas';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf } from '../form-fields';
import type { BeerPotForm } from '../schemas';
import type { DrinkRows } from './use-drink-rows';

type TextChange = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface PotFields {
  person: PersonRef | null;
  choosePerson: (person: PersonRef) => void;
  clearPerson: () => void;
  personError: string | undefined;
  link: string;
  changeLink: (event: TextChange) => void;
  touchLink: () => void;
}

export interface PotWriteForm extends BeerWriteState {
  fields: PotFields;
}

export interface PotDrinksWriteForm extends PotWriteForm {
  drinks: DrinkRows;
}

export const usePotFields = <TSubmitted>(
  control: Control<BeerPotForm, undefined, TSubmitted>,
): PotFields => {
  const personField = useController({ control, name: 'person' });
  const linkField = useController({ control, name: 'paymentLink' });

  return {
    person: personField.field.value,
    choosePerson: touchingChangeOf(personField.field),
    clearPerson: () => {
      personField.field.onChange(null);
    },
    personError: personField.fieldState.error?.message,
    link: linkField.field.value,
    changeLink: (event) => {
      linkField.field.onChange(event.target.value);
    },
    touchLink: linkField.field.onBlur,
  };
};
