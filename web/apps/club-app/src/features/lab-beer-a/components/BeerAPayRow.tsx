import { KkTabPay } from '@furria/ui/KkTabPay';
import type { FC } from 'react';
import type { LabBeerPerson, LabBeerPot } from '@/features/lab-beer/beer-lab-types';
import { COPIED_LABEL, COPY_LABEL, PAY_LABEL, PAYPAL_LABEL } from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import { useCopyNote } from '../hooks/use-copy-note';

interface BeerAPayRowProps {
  pot: LabBeerPot;
  owner: LabBeerPerson | null;
}

export const BeerAPayRow: FC<BeerAPayRowProps> = ({ pot, owner }) => {
  const clipboard = useCopyNote(pot.paymentNote);
  const payee = nameOf(owner);

  return (
    <KkTabPay
      label={PAY_LABEL}
      payee={payee}
      note={pot.paymentNote}
      link={pot.paymentLink}
      linkLabel={PAYPAL_LABEL}
      copyLabel={COPY_LABEL}
      copied={clipboard.copied}
      copiedLabel={COPIED_LABEL}
      onCopy={clipboard.copy}
    />
  );
};
