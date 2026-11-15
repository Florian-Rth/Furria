import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerPaymentMutation } from '../api';
import type { BeerPaymentPreview } from '../beer-hub';
import { fullPaymentOf, paymentPreviewOf, paymentRowsOf, steppedPaymentOf } from '../beer-hub';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import type { BeerJournalCrate } from '../schemas';
import { beerPaymentFormSchema } from '../schemas';

export interface PaymentForm extends BeerWriteState {
  preview: BeerPaymentPreview;
  step: (beerDrinkId: number, step: number) => void;
  payAll: () => void;
}

export interface PaymentTarget {
  beerPotId: number;
  person: PersonRef;
  oldestFirst: readonly BeerJournalCrate[];
}

export const usePaymentForm = (target: PaymentTarget, landing: WriteLanding): PaymentForm => {
  const paying = useBeerPaymentMutation();
  const rows = paymentRowsOf(target.oldestFirst);
  const write = useWriteForm({
    schema: beerPaymentFormSchema(rows),
    defaults: { drinks: [] },
    mutate: (drinks) =>
      paying.mutateAsync({
        beerPotId: target.beerPotId,
        personId: target.person.personId,
        drinks,
        crates: drinks.reduce((sum, drink) => sum + drink.crates, 0),
        name: target.person.firstName,
      }),
    landing: () => landing,
  });
  const drinksField = useController({ control: write.form.control, name: 'drinks' });
  const setDrinks = touchingChangeOf(drinksField.field);
  const picks = drinksField.field.value;

  return {
    preview: paymentPreviewOf(target.oldestFirst, picks),
    step: (beerDrinkId, step) => {
      setDrinks([...steppedPaymentOf(rows, picks, beerDrinkId, step)]);
    },
    payAll: () => {
      setDrinks([...fullPaymentOf(rows)]);
    },
    ...writeStateOf(write),
  };
};
