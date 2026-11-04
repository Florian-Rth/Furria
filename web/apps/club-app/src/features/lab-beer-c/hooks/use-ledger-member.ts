import { useState } from 'react';
import { LAB_BEER_VIEWERS, labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerEnrollment, LabBeerPerson } from '@/features/lab-beer/beer-lab-types';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import type { GiverLine } from '../ledger-givers';
import { giverLinesOf } from '../ledger-givers';
import type { LedgerHead, LedgerMonth } from '../ledger-statement';
import { ledgerHeadOf, monthsOf, statementOf } from '../ledger-statement';
import type { LedgerViewer } from '../schemas';
import type { CopyText } from './use-copy-text';
import { useCopyText } from './use-copy-text';
import type { LedgerBooking } from './use-ledger-booking';
import { useLedgerBooking } from './use-ledger-booking';

export type LedgerView = 'statement' | 'givers';

export interface LedgerMember {
  beer: LabBeerWorldState;
  booking: LedgerBooking;
  head: LedgerHead;
  months: readonly LedgerMonth[];
  givers: readonly GiverLine[];
  owner: LabBeerPerson | null;
  enrollment: LabBeerEnrollment | null;
  copy: CopyText;
  view: LedgerView;
  declaring: boolean;
  fireKey: number;
  chooseView: (view: string) => void;
  book: () => void;
  openDeclaration: () => void;
  join: () => void;
}

export const useLedgerMember = (viewer: LedgerViewer): LedgerMember => {
  const beer = useLabBeerWorld();
  const { world } = beer;
  const personId = LAB_BEER_VIEWERS[viewer];
  const booking = useLedgerBooking(beer, personId);
  const [view, setView] = useState<LedgerView>('statement');
  const [declaring, setDeclaring] = useState(false);
  const copy = useCopyText(world.pot.paymentNote);
  const enrollment =
    world.enrollments.findLast((candidate) => candidate.personId === personId) ?? null;

  const chooseView = (next: string): void => {
    setView(next === 'givers' ? 'givers' : 'statement');
  };

  const book = (): void => {
    if (booking.book()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const join = (): void => {
    booking.join();
    setDeclaring(false);
  };

  const openDeclaration = (): void => {
    setDeclaring(true);
  };

  return {
    beer,
    booking,
    head: ledgerHeadOf(booking.tab, world.now),
    months: monthsOf(statementOf(booking.tab, world.payments)),
    givers: giverLinesOf(world.crates, world.persons),
    owner: labBeerPersonOf(world.pot.ownerId),
    enrollment,
    copy,
    view,
    declaring,
    fireKey: booking.undo === null ? 0 : booking.spin,
    chooseView,
    book,
    openDeclaration,
    join,
  };
};
