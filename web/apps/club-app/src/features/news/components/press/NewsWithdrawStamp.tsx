import { KkDiagonalStamp } from '@furria/ui';
import type { FC } from 'react';
import { WITHDRAWN_STAMP } from '../../press-copy';

interface NewsWithdrawStampProps {
  fireKey: number;
}

export const NewsWithdrawStamp: FC<NewsWithdrawStampProps> = ({ fireKey }) => (
  <KkDiagonalStamp label={WITHDRAWN_STAMP} fireKey={fireKey} />
);
