import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { useState } from 'react';
import { SEAT_REQUEST_SHAPES } from '@/features/hall-plan/seat-request';
import { parseWhole } from '../planner-facts';
import { useTablePlannerContext } from '../table-planner-context';
import { SEAT_SHAPE_LABELS, toRowFacts } from '../table-planner-copy';

export interface SeatRequestForm {
  seats: string;
  shape: string;
  shapeChoices: readonly KkChoiceChip[];
  showsTablesPerRow: boolean;
  tablesPerRow: string;
  offer: string | null;
  isShort: boolean;
  changeSeats: (value: string) => void;
  changeShape: (value: string) => void;
  changeTablesPerRow: (value: string) => void;
}

const SHAPE_CHOICES: readonly KkChoiceChip[] = SEAT_REQUEST_SHAPES.map((shape) => ({
  id: shape,
  label: SEAT_SHAPE_LABELS[shape],
}));

export const useSeatRequestForm = (): SeatRequestForm => {
  const planner = useTablePlannerContext();
  const request = planner.seatRequest;
  const offer = planner.seatOffer;
  const [seatsText, setSeatsText] = useState(String(request.seats));
  const [perRowText, setPerRowText] = useState(String(request.tablesPerRow));

  return {
    seats: seatsText,
    shape: request.shape,
    shapeChoices: SHAPE_CHOICES,
    showsTablesPerRow: request.shape === 'block',
    tablesPerRow: perRowText,
    offer: offer === null ? null : toRowFacts(offer.tables, offer.chairs),
    isShort: offer !== null && !offer.enough,
    changeSeats: (value) => {
      setSeatsText(value);
      const seats = parseWhole(value);
      if (seats !== null && seats > 0) {
        planner.changeSeatRequest({ seats });
      }
    },
    changeShape: (value) => {
      const shape = SEAT_REQUEST_SHAPES.find((candidate) => candidate === value);
      if (shape !== undefined) {
        planner.changeSeatRequest({ shape });
      }
    },
    changeTablesPerRow: (value) => {
      setPerRowText(value);
      const tablesPerRow = parseWhole(value);
      if (tablesPerRow !== null && tablesPerRow > 0) {
        planner.changeSeatRequest({ tablesPerRow });
      }
    },
  };
};
