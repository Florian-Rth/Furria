import { KkOfficeMark, KkRoster } from '@furria/ui';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { OFFICE_LANDING_KIND, toRunningSeats } from '../board-hub';
import { OPEN_OFFICE_LABEL } from '../board-hub-copy';
import type { BoardOffice } from '../schemas';
import { BoardRosterSeat } from './BoardRosterSeat';
import { OfficeFlags } from './OfficeFlags';

interface BoardRosterLineProps {
  office: BoardOffice;
  today: string;
  compact: boolean;
  selected: boolean;
  highlightedKey: string | null;
  onOpen: (boardOfficeId: number) => void;
}

export const BoardRosterLine: FC<BoardRosterLineProps> = ({
  office,
  today,
  compact,
  selected,
  highlightedKey,
  onOpen,
}) => {
  const landing = toLandingKey(OFFICE_LANDING_KIND, office.boardOfficeId);
  const open = (): void => {
    onOpen(office.boardOfficeId);
  };
  const seats = toRunningSeats(office, today).map((seat) => (
    <BoardRosterSeat key={seat.boardSeatId} seat={seat} compact={compact} />
  ));
  const mark = <KkOfficeMark icon={office.icon} state="held" />;
  const flags = <OfficeFlags office={office} />;

  return (
    <KkRoster.Line
      mark={mark}
      name={office.name}
      flags={flags}
      openLabel={OPEN_OFFICE_LABEL}
      selected={selected}
      landing={landing}
      highlight={highlightedKey === landing}
      compact={compact}
      onOpen={open}
    >
      {seats}
    </KkRoster.Line>
  );
};
