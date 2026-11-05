import { KkTabPay } from '@furria/ui/KkTabPay';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import { cashLine, PAY_EARLIER_LABEL, PAY_LABEL, PAYPAL_LABEL, payeeLine } from '../beer-list-copy';
import { personNameOf } from '../beer-list-format';
import type { BeerPayee } from '../beer-tab';

interface BeerPayRowProps {
  payee: BeerPayee;
}

export const BeerPayRow: FC<BeerPayRowProps> = ({ payee }) => {
  const label = payee.current ? PAY_LABEL : PAY_EARLIER_LABEL;
  const line = payeeLine(personNameOf(payee.owner), formatEuroCents(payee.openCents));
  const cash = cashLine(payee.owner?.firstName ?? null);

  return (
    <KkTabPay
      label={label}
      payee={line}
      cash={cash}
      link={payee.payHref}
      linkLabel={PAYPAL_LABEL}
    />
  );
};
