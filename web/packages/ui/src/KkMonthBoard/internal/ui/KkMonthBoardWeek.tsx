import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { useIsMobile } from '../../../use-is-mobile';
import { MONTH_BOARD_COLUMNS } from '../logic/month-board-grid';
import { hiddenPerDay, packWeek } from '../logic/month-board-lanes';
import type { KkMonthBoardBarData, KkMonthBoardDayData } from '../logic/month-board-types';
import { KkMonthBoardBar } from './KkMonthBoardBar';
import { KkMonthBoardDay } from './KkMonthBoardDay';

const { monthBoard, line } = kkTokens;
const NO_HEIGHT = '0px';
const NO_HIDDEN = 0;

const toRows = (titled: boolean, laneLimit: number, overflows: boolean): string => {
  const laneHeight = titled ? monthBoard.bar : monthBoard.thinBar;
  const lanes = Array.from({ length: monthBoard.openLanes }, (_, lane) =>
    lane < laneLimit ? `calc(${laneHeight} + ${monthBoard.laneGap})` : NO_HEIGHT,
  );

  return [monthBoard.dayRow, ...lanes, overflows ? monthBoard.overflowRow : NO_HEIGHT].join(' ');
};

interface KkMonthBoardWeekProps {
  days: readonly KkMonthBoardDayData[];
  bars: readonly KkMonthBoardBarData[];
  open: boolean;
  onSelectDay: (isoDay: string) => void;
}

export const KkMonthBoardWeek: FC<KkMonthBoardWeekProps> = ({ days, bars, open, onSelectDay }) => {
  const isMobile = useIsMobile();
  const titled = open || !isMobile;
  const laneLimit = titled ? monthBoard.openLanes : monthBoard.closedLanes;
  const allPlaced = packWeek(
    days.map((day) => day.isoDay),
    bars,
  );
  const hidden = hiddenPerDay(allPlaced, days.length, laneLimit);
  const overflows = hidden.some((count) => count > NO_HIDDEN);
  const dayCells = days.map((day, column) => (
    <KkMonthBoardDay
      key={day.isoDay}
      day={day}
      column={column}
      hidden={hidden[column] ?? NO_HIDDEN}
      onSelect={onSelectDay}
    />
  ));
  const barItems = allPlaced
    .filter((item) => item.lane < monthBoard.openLanes)
    .map((item) => <KkMonthBoardBar key={item.bar.id} placed={item} titled={titled} />);

  return (
    <Box
      role="group"
      data-kk-month-board-week
      sx={{
        display: 'grid',
        gridTemplateColumns: MONTH_BOARD_COLUMNS,
        gridTemplateRows: toRows(titled, laneLimit, overflows),
        transition: `grid-template-rows ${monthBoard.openSeconds}s ease-out`,
        borderTopWidth: line.hair,
        borderTopStyle: 'solid',
        borderTopColor: 'divider',
        minWidth: 0,
      }}
    >
      {dayCells}
      {barItems}
    </Box>
  );
};
