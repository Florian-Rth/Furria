import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerCratesForMutation } from '../api';
import { countOfText } from '../beer-hub';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import { beerCratesFormSchema } from '../schemas';

const MAX_PER_BOOKING = 20;
const NO_PERSON = '';

export interface CratesForm extends BeerWriteState {
  personValue: string;
  choosePerson: (value: string) => void;
  personError: string | undefined;
  person: PersonRef | null;
  countText: string;
  setCountText: (text: string) => void;
  countError: string | undefined;
  count: number;
  maxCount: number;
  paid: boolean;
  setPaid: (paid: boolean) => void;
}

export interface CratesFormSource {
  beerPotId: number;
  candidates: readonly PersonRef[];
  initialPersonId: number | null;
  stock: number;
  landing: WriteLanding;
}

const initialPersonOf = (source: CratesFormSource): string =>
  source.candidates.some((candidate) => candidate.personId === source.initialPersonId)
    ? String(source.initialPersonId)
    : NO_PERSON;

export const useCratesForm = (source: CratesFormSource): CratesForm => {
  const booking = useBeerCratesForMutation(source.beerPotId);
  const maxCount = Math.min(MAX_PER_BOOKING, source.stock);
  const write = useWriteForm({
    schema: beerCratesFormSchema(
      source.candidates.map((candidate) => candidate.personId),
      maxCount,
    ),
    defaults: { personId: initialPersonOf(source), count: '1', paid: false },
    mutate: (booked) => {
      const name =
        source.candidates.find((candidate) => candidate.personId === booked.personId)?.firstName ??
        '';

      return booking.mutateAsync({ ...booked, name });
    },
    landing: () => source.landing,
  });
  const personField = useController({ control: write.form.control, name: 'personId' });
  const countField = useController({ control: write.form.control, name: 'count' });
  const paidField = useController({ control: write.form.control, name: 'paid' });
  const personValue = personField.field.value;

  return {
    personValue,
    choosePerson: touchingChangeOf(personField.field),
    personError: personField.fieldState.error?.message,
    person:
      source.candidates.find((candidate) => String(candidate.personId) === personValue) ?? null,
    countText: countField.field.value,
    setCountText: touchingChangeOf(countField.field),
    countError: countField.fieldState.error?.message,
    count: countOfText(countField.field.value),
    maxCount,
    paid: paidField.field.value,
    setPaid: touchingChangeOf(paidField.field),
    ...writeStateOf(write),
  };
};
