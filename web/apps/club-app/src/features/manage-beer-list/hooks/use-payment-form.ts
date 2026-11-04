import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerPaymentMutation } from '../api';
import type { BeerPaymentPreview } from '../beer-hub';
import { countOfText, paymentPreviewOf } from '../beer-hub';
import type { BeerJournalCrate } from '../schemas';

export interface PaymentForm {
  text: string;
  setText: (text: string) => void;
  count: number;
  valid: boolean;
  preview: BeerPaymentPreview;
  busy: boolean;
  submit: () => void;
}

export interface PaymentTarget {
  beerPotId: number;
  person: PersonRef;
  oldestFirst: readonly BeerJournalCrate[];
}

export const usePaymentForm = (target: PaymentTarget, onDone: () => void): PaymentForm => {
  const [text, setText] = useState(String(target.oldestFirst.length));
  const paying = useBeerPaymentMutation();
  const count = countOfText(text);
  const valid = count >= 1 && count <= target.oldestFirst.length;

  return {
    text,
    setText,
    count,
    valid,
    preview: paymentPreviewOf(target.oldestFirst, count),
    busy: paying.isPending,
    submit: () => {
      if (valid) {
        paying.mutate(
          {
            beerPotId: target.beerPotId,
            personId: target.person.personId,
            crates: count,
            name: target.person.firstName,
          },
          { onSuccess: onDone },
        );
      }
    },
  };
};
