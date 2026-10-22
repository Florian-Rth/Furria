import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { EventPaneKey } from '../schemas';
import { useCloseOnEscape } from './use-close-on-escape';

const EVENTS_ROUTE_ID = '/_app/events';
const EVENTS_PATH = '/events';

export interface PaneSelection {
  eventId: number;
  pane: EventPaneKey;
}

export interface PaneSelectionControl {
  selection: PaneSelection | null;
  isWide: boolean;
  select: (next: PaneSelection) => void;
  close: () => void;
}

export const usePaneSelection = (): PaneSelectionControl => {
  const isWide = useIsWideScreen();
  const navigate = useNavigate();
  const { event, step } = useSearch({ from: EVENTS_ROUTE_ID });
  const selection =
    event === undefined || step === undefined ? null : { eventId: event, pane: step };

  const close = (): void => {
    void navigate({
      from: EVENTS_PATH,
      to: EVENTS_PATH,
      search: (previous) => ({ ...previous, event: undefined, step: undefined }),
      replace: true,
      resetScroll: false,
    });
  };

  useCloseOnEscape(isWide && selection !== null, close);

  return {
    selection,
    isWide,
    select: (next) => {
      void navigate({
        from: EVENTS_PATH,
        to: EVENTS_PATH,
        search: (previous) => ({ ...previous, event: next.eventId, step: next.pane }),
        replace: selection !== null,
        resetScroll: false,
      });
    },
    close,
  };
};
