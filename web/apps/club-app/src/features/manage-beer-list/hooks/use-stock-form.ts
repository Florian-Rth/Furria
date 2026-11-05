import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useBeerStockMutation } from '../api';
import { signedCountOfText, stockChangeOf } from '../beer-hub';
import { HUB_LANDING } from '../beer-landing';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import type { BeerStockChange } from '../schemas';
import { beerStockFormSchema } from '../schemas';

export interface StockForm extends BeerWriteState {
  cratesText: string;
  setCratesText: (text: string) => void;
  cratesError: string | undefined;
  change: BeerStockChange | null;
}

export const useStockForm = (beerPotId: number, stock: number): StockForm => {
  const booking = useBeerStockMutation(beerPotId);
  const write = useWriteForm({
    schema: beerStockFormSchema(stock),
    defaults: { crates: '1' },
    mutate: (change) => booking.mutateAsync(change),
    landing: () => HUB_LANDING,
  });
  const cratesField = useController({ control: write.form.control, name: 'crates' });

  return {
    cratesText: cratesField.field.value,
    setCratesText: touchingChangeOf(cratesField.field),
    cratesError: cratesField.fieldState.error?.message,
    change: stockChangeOf(signedCountOfText(cratesField.field.value)),
    ...writeStateOf(write),
  };
};
