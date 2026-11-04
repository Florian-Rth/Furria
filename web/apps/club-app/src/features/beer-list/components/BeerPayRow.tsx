import { KkTabPay } from '@furria/ui/KkTabPay';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import {
  COPIED_LABEL,
  COPY_LABEL,
  PAY_EARLIER_LABEL,
  PAY_LABEL,
  PAYPAL_LABEL,
  payeeLine,
} from '../beer-list-copy';
import { personNameOf } from '../beer-list-format';
import type { BeerPayee } from '../beer-tab';
import { useCopyNote } from '../hooks/use-copy-note';

interface BeerPayRowProps {
  payee: BeerPayee;
}

export const BeerPayRow: FC<BeerPayRowProps> = ({ payee }) => {
  const clipboard = useCopyNote(payee.note);
  const label = payee.current ? PAY_LABEL : PAY_EARLIER_LABEL;
  const line = payeeLine(personNameOf(payee.owner), formatEuroCents(payee.openCents));

  return (
    <KkTabPay
      label={label}
      payee={line}
      note={payee.note}
      link={payee.payHref}
      linkLabel={PAYPAL_LABEL}
      copyLabel={COPY_LABEL}
      copied={clipboard.copied}
      copiedLabel={COPIED_LABEL}
      onCopy={clipboard.copy}
    />
  );
};
