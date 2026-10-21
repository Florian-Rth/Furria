import { KkMeta, KkTenureChain } from '@furria/ui';
import type { FC } from 'react';
import { toSeatChain } from '../board-hub';
import { HISTORY_EMPTY, HISTORY_TITLE } from '../board-hub-copy';
import type { BoardOffice } from '../schemas';
import { OfficeChainRow } from './OfficeChainRow';

interface OfficeHistoryTabProps {
  office: BoardOffice;
  today: string;
}

export const OfficeHistoryTab: FC<OfficeHistoryTabProps> = ({ office, today }) => {
  const rows = toSeatChain(office).map((seat) => (
    <OfficeChainRow key={seat.boardSeatId} seat={seat} today={today} />
  ));

  if (rows.length === 0) {
    return <KkMeta>{HISTORY_EMPTY}</KkMeta>;
  }

  return <KkTenureChain label={HISTORY_TITLE}>{rows}</KkTenureChain>;
};
