import { useState } from 'react';
import { useBeerStockMutation } from '../api';
import type { BeerStockCause, BeerStockChange, BeerStockDirection } from '../beer-hub';
import { causeFor, countOfText, STOCK_CAUSES, stockChangeOf } from '../beer-hub';

const DEFAULT_COUNT = '1';

export interface StockForm {
  direction: BeerStockDirection;
  chooseDirection: (direction: BeerStockDirection) => void;
  causes: readonly BeerStockCause[];
  cause: BeerStockCause | null;
  chooseCause: (cause: BeerStockCause) => void;
  countText: string;
  setCountText: (text: string) => void;
  change: BeerStockChange | null;
  busy: boolean;
  submit: () => void;
}

export const useStockForm = (beerPotId: number, onDone: () => void): StockForm => {
  const [direction, setDirection] = useState<BeerStockDirection>('up');
  const [picked, setPicked] = useState<BeerStockCause | null>('delivery');
  const [countText, setCountText] = useState(DEFAULT_COUNT);
  const booking = useBeerStockMutation(beerPotId);
  const cause = causeFor(direction, picked);
  const change = stockChangeOf(direction, cause, countOfText(countText));

  return {
    direction,
    chooseDirection: setDirection,
    causes: STOCK_CAUSES[direction],
    cause,
    chooseCause: setPicked,
    countText,
    setCountText,
    change,
    busy: booking.isPending,
    submit: () => {
      if (change !== null) {
        booking.mutate(change, { onSuccess: onDone });
      }
    },
  };
};
