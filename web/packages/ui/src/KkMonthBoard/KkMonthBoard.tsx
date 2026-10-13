import { KkMonthBoardPage } from './internal/layout/KkMonthBoardPage';
import { KkMonthBoardRoot } from './internal/layout/KkMonthBoardRoot';
import { KkMonthBoardNav } from './internal/ui/KkMonthBoardNav';
import { KkMonthBoardWeek } from './internal/ui/KkMonthBoardWeek';
import { KkMonthBoardWeekdays } from './internal/ui/KkMonthBoardWeekdays';

export const KkMonthBoard = Object.assign(KkMonthBoardRoot, {
  Nav: KkMonthBoardNav,
  Weekdays: KkMonthBoardWeekdays,
  Page: KkMonthBoardPage,
  Week: KkMonthBoardWeek,
});
