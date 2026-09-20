import { useState } from 'react';
import type { BoardOfficeEntry } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

export type BoardDialog = 'rename' | 'archive' | 'open-seat';

export interface EndSeatTarget {
  office: BoardOfficeEntry;
  seat: BoardSeat;
}

export interface BoardDialogs {
  openDialog: BoardDialog | null;
  office: BoardOfficeEntry | null;
  endSeat: EndSeatTarget | null;
  openFor: (dialog: BoardDialog, boardOfficeId: number) => void;
  openEndSeat: (boardOfficeId: number, boardSeatId: number) => void;
  close: () => void;
}

interface SeatSelection {
  boardOfficeId: number;
  boardSeatId: number;
}

export const useBoardDialogs = (entries: readonly BoardOfficeEntry[]): BoardDialogs => {
  const [openDialog, setOpenDialog] = useState<BoardDialog | null>(null);
  const [officeId, setOfficeId] = useState<number | null>(null);
  const [seatSelection, setSeatSelection] = useState<SeatSelection | null>(null);

  const openFor = (dialog: BoardDialog, boardOfficeId: number): void => {
    setSeatSelection(null);
    setOfficeId(boardOfficeId);
    setOpenDialog(dialog);
  };

  const openEndSeat = (boardOfficeId: number, boardSeatId: number): void => {
    setOpenDialog(null);
    setOfficeId(null);
    setSeatSelection({ boardOfficeId, boardSeatId });
  };

  const close = (): void => {
    setOpenDialog(null);
    setOfficeId(null);
    setSeatSelection(null);
  };

  const office = entries.find((entry) => entry.boardOfficeId === officeId) ?? null;
  const seatOffice =
    entries.find((entry) => entry.boardOfficeId === seatSelection?.boardOfficeId) ?? null;
  const seat =
    seatOffice?.seats.find((row) => row.boardSeatId === seatSelection?.boardSeatId) ?? null;

  return {
    openDialog,
    office,
    endSeat: seatOffice === null || seat === null ? null : { office: seatOffice, seat },
    openFor,
    openEndSeat,
    close,
  };
};
