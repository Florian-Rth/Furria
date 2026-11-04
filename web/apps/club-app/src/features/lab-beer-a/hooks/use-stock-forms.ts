import { useState } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import type { LabBeerCorrectionReason } from '@/features/lab-beer/beer-lab-types';
import { correctionDone, deliveryDone } from '../beer-a-copy';

export type BeerACorrectionDirection = 'less' | 'more';

const REASONS: readonly LabBeerCorrectionReason[] = ['shrinkage', 'breakage', 'miscount'];

export interface BeerAStockOutcome {
  text: string;
  refused: boolean;
}

export interface BeerAStockForms {
  deliveryText: string;
  deliveryCount: number;
  correctionText: string;
  correctionCount: number;
  reason: LabBeerCorrectionReason;
  direction: BeerACorrectionDirection;
  canChooseDirection: boolean;
  outcome: BeerAStockOutcome | null;
  changeDelivery: (text: string) => void;
  changeCorrection: (text: string) => void;
  chooseReason: (id: string) => void;
  chooseDirection: (id: string) => void;
  deliver: () => void;
  correct: () => void;
}

const countOf = (text: string): number => {
  const parsed = Number.parseInt(text, 10);

  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
};

export const useStockForms = (
  deliver: (count: number) => LabBeerRefusal | null,
  correct: (count: number, reason: LabBeerCorrectionReason) => LabBeerRefusal | null,
  refusalText: (refusal: LabBeerRefusal) => string,
): BeerAStockForms => {
  const [deliveryText, setDeliveryText] = useState('10');
  const [correctionText, setCorrectionText] = useState('1');
  const [reason, setReason] = useState<LabBeerCorrectionReason>('shrinkage');
  const [chosenDirection, setChosenDirection] = useState<BeerACorrectionDirection>('less');
  const [outcome, setOutcome] = useState<BeerAStockOutcome | null>(null);
  const canChooseDirection = reason === 'miscount';
  const direction = canChooseDirection ? chosenDirection : 'less';
  const deliveryCount = countOf(deliveryText);
  const correctionCount = countOf(correctionText);

  const settle = (refusal: LabBeerRefusal | null, done: string): void => {
    setOutcome(
      refusal === null
        ? { text: done, refused: false }
        : { text: refusalText(refusal), refused: true },
    );
  };

  return {
    deliveryText,
    deliveryCount,
    correctionText,
    correctionCount,
    reason,
    direction,
    canChooseDirection,
    outcome,
    changeDelivery: setDeliveryText,
    changeCorrection: setCorrectionText,
    chooseReason: (id) => {
      setReason(REASONS.find((known) => known === id) ?? 'shrinkage');
    },
    chooseDirection: (id) => {
      setChosenDirection(id === 'more' ? 'more' : 'less');
    },
    deliver: () => {
      settle(deliver(deliveryCount), deliveryDone(deliveryCount));
    },
    correct: () => {
      const signed = direction === 'less' ? -correctionCount : correctionCount;
      settle(correct(signed, reason), correctionDone(correctionCount));
    },
  };
};
