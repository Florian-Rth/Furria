import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerPaymentMutation } from '../api';
import type { BeerPaymentPreview } from '../beer-hub';
import { countOfText, paymentPreviewOf } from '../beer-hub';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import type { BeerJournalCrate } from '../schemas';
import { beerPaymentFormSchema } from '../schemas';

export interface PaymentForm extends BeerWriteState {
  cratesText: string;
  setCratesText: (text: string) => void;
  cratesError: string | undefined;
  count: number;
  preview: BeerPaymentPreview;
}

export interface PaymentTarget {
  beerPotId: number;
  person: PersonRef;
  oldestFirst: readonly BeerJournalCrate[];
}

export const usePaymentForm = (target: PaymentTarget, landing: WriteLanding): PaymentForm => {
  const paying = useBeerPaymentMutation();
  const write = useWriteForm({
    schema: beerPaymentFormSchema(target.oldestFirst.length),
    defaults: { crates: String(target.oldestFirst.length) },
    mutate: (crates) =>
      paying.mutateAsync({
        beerPotId: target.beerPotId,
        personId: target.person.personId,
        crates,
        name: target.person.firstName,
      }),
    landing: () => landing,
  });
  const cratesField = useController({ control: write.form.control, name: 'crates' });
  const count = countOfText(cratesField.field.value);

  return {
    cratesText: cratesField.field.value,
    setCratesText: touchingChangeOf(cratesField.field),
    cratesError: cratesField.fieldState.error?.message,
    count,
    preview: paymentPreviewOf(target.oldestFirst, count),
    ...writeStateOf(write),
  };
};
