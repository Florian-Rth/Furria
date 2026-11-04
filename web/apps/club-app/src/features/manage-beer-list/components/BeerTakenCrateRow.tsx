import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerCrateUndoMutation } from '../api';
import { crateUndoConfirmOf } from '../beer-hub-copy';
import type { BeerJournalCrate } from '../schemas';
import { BeerCrateLine } from './BeerCrateLine';
import { BeerUndoButton } from './BeerUndoButton';

const ONE_CRATE_CONFIRM = crateUndoConfirmOf(1);

interface BeerTakenCrateRowProps {
  crate: BeerJournalCrate;
  now: string;
}

export const BeerTakenCrateRow: FC<BeerTakenCrateRowProps> = ({ crate, now }) => {
  const undoing = useBeerCrateUndoMutation();
  const undo = (): void => {
    undoing.mutate(crate.crateId);
  };
  const action =
    crate.beerPaymentId === null ? (
      <BeerUndoButton confirm={ONE_CRATE_CONFIRM} busy={undoing.isPending} onConfirm={undo} />
    ) : null;

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <BeerCrateLine crate={crate} now={now} sx={{ flex: 1, minWidth: 0 }} />
      {action}
    </Stack>
  );
};
