import { useState } from 'react';
import { bookCorrection, bookDelivery } from '@/features/lab-beer/beer-lab-actions';
import type { LabBeerCorrectionReason } from '@/features/lab-beer/beer-lab-types';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import { REFUSALS } from '../ledger-copy';
import type { StockLine } from '../ledger-hub';
import { stockLinesOf } from '../ledger-hub';

const REASONS: readonly LabBeerCorrectionReason[] = ['shrinkage', 'breakage', 'miscount'];

export interface HubStock {
  lines: readonly StockLine[];
  delivery: string;
  correction: string;
  reason: LabBeerCorrectionReason;
  refusal: string | null;
  freshId: number | null;
  setDelivery: (value: string) => void;
  setCorrection: (value: string) => void;
  setReason: (value: string) => void;
  confirmDelivery: () => void;
  confirmCorrection: () => void;
}

const wholeOf = (value: string): number => {
  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? 0 : parsed;
};

export const useHubStock = (beer: LabBeerWorldState, operatorId: number): HubStock => {
  const [delivery, setDelivery] = useState('');
  const [correction, setCorrection] = useState('');
  const [reason, setReasonState] = useState<LabBeerCorrectionReason>('shrinkage');
  const [refusal, setRefusal] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<number | null>(null);
  const nextId =
    beer.world.movements.reduce((highest, movement) => Math.max(highest, movement.id), 0) + 1;

  const settle = (refused: string | null, reset: () => void): void => {
    setRefusal(refused === null ? null : (REFUSALS[refused] ?? null));

    if (refused === null) {
      setFreshId(nextId);
      reset();
    }
  };

  return {
    lines: stockLinesOf(beer.world),
    delivery,
    correction,
    reason,
    refusal,
    freshId,
    setDelivery,
    setCorrection,
    setReason: (value) => {
      setReasonState(REASONS.find((candidate) => candidate === value) ?? 'shrinkage');
    },
    confirmDelivery: () => {
      const count = wholeOf(delivery);

      settle(
        beer.apply((current, at) => bookDelivery(current, count, operatorId, at)),
        () => {
          setDelivery('');
        },
      );
    },
    confirmCorrection: () => {
      const count = wholeOf(correction);

      settle(
        beer.apply((current, at) => bookCorrection(current, count, reason, operatorId, at)),
        () => {
          setCorrection('');
        },
      );
    },
  };
};
