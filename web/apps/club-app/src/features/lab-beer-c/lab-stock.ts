import { bookCorrection } from '@/features/lab-beer/beer-lab-actions';
import { stockOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';

export const emptyLabStock = (beer: LabBeerWorldState, operatorId: number): void => {
  beer.apply((current, at) =>
    bookCorrection(
      current,
      -stockOf(current.movements, current.crates),
      'miscount',
      operatorId,
      at,
    ),
  );
};
