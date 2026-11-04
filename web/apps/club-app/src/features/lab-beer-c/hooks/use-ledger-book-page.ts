import { LAB_BEER_VIEWERS, labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerPerson } from '@/features/lab-beer/beer-lab-types';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import { emptyLabStock } from '../lab-stock';
import type { LedgerViewer } from '../schemas';
import type { CopyText } from './use-copy-text';
import { useCopyText } from './use-copy-text';
import type { LedgerBooking } from './use-ledger-booking';
import { useLedgerBooking } from './use-ledger-booking';

export interface LedgerBookPage {
  booking: LedgerBooking;
  owner: LabBeerPerson | null;
  person: LabBeerPerson | null;
  paymentLink: string | null;
  paymentNote: string | null;
  copy: CopyText;
  fireKey: number;
  emptyStock: () => void;
}

export const useLedgerBookPage = (viewer: LedgerViewer): LedgerBookPage => {
  const beer = useLabBeerWorld();
  const personId = LAB_BEER_VIEWERS[viewer];
  const booking = useLedgerBooking(beer, personId);
  const copy = useCopyText(beer.world.pot.paymentNote);

  const emptyStock = (): void => {
    emptyLabStock(beer, LAB_BEER_VIEWERS.owner);
  };

  return {
    booking,
    owner: labBeerPersonOf(beer.world.pot.ownerId),
    person: labBeerPersonOf(personId),
    paymentLink: beer.world.pot.paymentLink,
    paymentNote: beer.world.pot.paymentNote,
    copy,
    fireKey: booking.undo === null ? 0 : booking.spin,
    emptyStock,
  };
};
