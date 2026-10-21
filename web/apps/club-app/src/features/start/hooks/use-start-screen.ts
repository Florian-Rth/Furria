import type { ConfettiGlobe } from './use-confetti-globe';
import { useConfettiGlobe } from './use-confetti-globe';
import type { DayFocus } from './use-day-focus';
import { useDayFocus } from './use-day-focus';
import type { StartLook } from './use-start-look';
import { useStartLook } from './use-start-look';
import type { StartView } from './use-start-view';
import { useStartView } from './use-start-view';
import type { StripCell } from './use-week-strip';
import { useWeekStrip } from './use-week-strip';

export interface StartScreenView {
  view: StartView;
  focus: DayFocus;
  cells: StripCell[] | null;
  look: StartLook;
  globe: ConfettiGlobe;
  loading: boolean;
  showsBoard: boolean;
}

export const useStartScreen = (): StartScreenView => {
  const view = useStartView();
  const focus = useDayFocus();
  const cells = useWeekStrip(view.screen === 'board' ? view.board : null, focus.show);
  const look = useStartLook();
  const globe = useConfettiGlobe();

  return {
    view,
    focus,
    cells,
    look,
    globe,
    loading: view.screen === 'waiting' || view.screen === 'skeleton',
    showsBoard: view.screen === 'board',
  };
};
