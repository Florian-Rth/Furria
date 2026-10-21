import { KkRosterRoot } from './internal/layout/KkRosterRoot';
import { KkRosterFlag } from './internal/ui/KkRosterFlag';
import { KkRosterLine } from './internal/ui/KkRosterLine';
import { KkRosterSeat } from './internal/ui/KkRosterSeat';

export const KkRoster = Object.assign(KkRosterRoot, {
  Line: KkRosterLine,
  Seat: KkRosterSeat,
  Flag: KkRosterFlag,
});
