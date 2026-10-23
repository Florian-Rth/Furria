import Stack from '@mui/material/Stack';
import type { FC, ReactElement } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import type { PlannerMode } from '../schemas';
import { PlannerCastBlock } from './PlannerCastBlock';
import { PlannerLineActions } from './PlannerLineActions';
import { PlannerLineWishes } from './PlannerLineWishes';
import { PlannerPlaces } from './PlannerPlaces';

type DetailPart = 'cast' | 'wishes' | 'places';

const ORDERS: Record<PlannerMode, readonly DetailPart[]> = {
  pick: ['cast', 'wishes', 'places'],
  order: ['places', 'cast', 'wishes'],
  check: ['places', 'wishes', 'cast'],
};

interface PlannerRowDetailProps {
  line: DraftLine;
}

export const PlannerRowDetail: FC<PlannerRowDetailProps> = ({ line }) => {
  const { mode } = usePlanner();
  const parts: Record<DetailPart, ReactElement> = {
    cast: <PlannerCastBlock key="cast" line={line} />,
    wishes: <PlannerLineWishes key="wishes" line={line} />,
    places: <PlannerPlaces key="places" line={line} />,
  };
  const ordered = ORDERS[mode].map((part) => parts[part]);

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <PlannerLineActions line={line} />
      {ordered}
    </Stack>
  );
};
