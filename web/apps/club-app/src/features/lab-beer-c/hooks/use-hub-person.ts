import { useState } from 'react';
import { bookCrates, bookPayment, endEnrollment } from '@/features/lab-beer/beer-lab-actions';
import { stockOf, tabOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerEnrollment, LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import type { SettlementPreview } from '../ledger-booking';
import { bookedIdsOf, clampCount, countLimitOf, settlementOf } from '../ledger-booking';
import { REFUSALS } from '../ledger-copy';
import type { LedgerMonth } from '../ledger-statement';
import { monthsOf, statementOf } from '../ledger-statement';

export type PersonTab = 'tab' | 'enrollment';

export type PersonComposer = 'none' | 'payment' | 'crate';

export interface HubPerson {
  tab: LabBeerTab;
  months: readonly LedgerMonth[];
  enrollment: LabBeerEnrollment | null;
  enrolled: boolean;
  section: PersonTab;
  composer: PersonComposer;
  payCount: number;
  settlement: SettlementPreview;
  crateCount: number;
  crateLimit: number;
  ending: boolean;
  refusal: string | null;
  freshIds: readonly number[];
  chooseSection: (section: string) => void;
  startPayment: () => void;
  setPayCount: (count: number) => void;
  confirmPayment: () => void;
  startCrate: () => void;
  setCrateCount: (count: number) => void;
  confirmCrate: () => void;
  cancel: () => void;
  askEnd: () => void;
  closeEnd: () => void;
  confirmEnd: () => void;
}

export const useHubPerson = (
  beer: LabBeerWorldState,
  personId: number,
  operatorId: number,
): HubPerson => {
  const { world } = beer;
  const [section, setSection] = useState<PersonTab>('tab');
  const [composer, setComposer] = useState<PersonComposer>('none');
  const [wantedPay, setWantedPay] = useState(1);
  const [wantedCrates, setWantedCrates] = useState(1);
  const [ending, setEnding] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [freshIds, setFreshIds] = useState<readonly number[]>([]);
  const tab = tabOf(personId, world.crates, world.payments);
  const payCount = clampCount(wantedPay, tab.openCount);
  const crateLimit = countLimitOf(stockOf(world.movements, world.crates));
  const crateCount = clampCount(wantedCrates, crateLimit);
  const enrollment =
    world.enrollments.findLast((candidate) => candidate.personId === personId) ?? null;

  const settle = (refused: string | null, touchedIds: readonly number[]): void => {
    setRefusal(refused === null ? null : (REFUSALS[refused] ?? null));

    if (refused === null) {
      setComposer('none');
      setFreshIds(touchedIds);
    }
  };

  const confirmPayment = (): void => {
    const settledIds = settlementOf(tab, payCount).crates.map((entry) => entry.crate.id);

    settle(
      beer.apply((current, at) => bookPayment(current, personId, payCount, operatorId, at)),
      settledIds,
    );
  };

  const confirmCrate = (): void => {
    const bookedIds = bookedIdsOf(world, crateCount);

    settle(
      beer.apply((current, at) => bookCrates(current, personId, crateCount, operatorId, at)),
      bookedIds,
    );
  };

  const confirmEnd = (): void => {
    beer.apply((current, at) => endEnrollment(current, personId, operatorId, at));
    setEnding(false);
  };

  return {
    tab,
    months: monthsOf(statementOf(tab, world.payments)),
    enrollment,
    enrolled: enrollment !== null && enrollment.endedAt === null,
    section,
    composer,
    payCount,
    settlement: settlementOf(tab, payCount),
    crateCount,
    crateLimit,
    ending,
    refusal,
    freshIds,
    chooseSection: (next) => {
      setSection(next === 'enrollment' ? 'enrollment' : 'tab');
    },
    startPayment: () => {
      setSection('tab');
      setWantedPay(tab.openCount);
      setComposer('payment');
    },
    setPayCount: setWantedPay,
    confirmPayment,
    startCrate: () => {
      setSection('tab');
      setWantedCrates(1);
      setComposer('crate');
    },
    setCrateCount: setWantedCrates,
    confirmCrate,
    cancel: () => {
      setComposer('none');
      setRefusal(null);
    },
    askEnd: () => {
      setEnding(true);
    },
    closeEnd: () => {
      setEnding(false);
    },
    confirmEnd,
  };
};
