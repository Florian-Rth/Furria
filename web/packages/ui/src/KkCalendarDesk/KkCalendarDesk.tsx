import { KkCalendarDeskMain } from './internal/layout/KkCalendarDeskMain';
import { KkCalendarDeskPane } from './internal/layout/KkCalendarDeskPane';
import { KkCalendarDeskRail } from './internal/layout/KkCalendarDeskRail';
import { KkCalendarDeskRoot } from './internal/layout/KkCalendarDeskRoot';

export const KkCalendarDesk = Object.assign(KkCalendarDeskRoot, {
  Rail: KkCalendarDeskRail,
  Main: KkCalendarDeskMain,
  Pane: KkCalendarDeskPane,
});
