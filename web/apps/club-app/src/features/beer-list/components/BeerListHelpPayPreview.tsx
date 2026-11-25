import { KkTabPay } from '@furria/ui/KkTabPay';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import { cashLine, PAY_LABEL, PAYPAL_LABEL, payeeLine } from '../beer-list-copy';

const SAMPLE_OWNER_FIRST = 'Gerda';
const SAMPLE_OWNER = 'Gerda Lang';
const SAMPLE_LINK = 'https://paypal.me/';
const SAMPLE_PAYEE = payeeLine(SAMPLE_OWNER, formatEuroCents(3600));
const SAMPLE_CASH = cashLine(SAMPLE_OWNER_FIRST);

export const BeerListHelpPayPreview: FC = () => (
  <KkTabPay
    label={PAY_LABEL}
    payee={SAMPLE_PAYEE}
    cash={SAMPLE_CASH}
    link={SAMPLE_LINK}
    linkLabel={PAYPAL_LABEL}
  />
);
