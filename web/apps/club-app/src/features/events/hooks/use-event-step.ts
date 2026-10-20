import { useIsWideScreen } from '@furria/ui';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import type { EventPaneKey } from '../schemas';

const EVENT_ROUTE_ID = '/_app/events_/$eventId';
const EVENT_PATH = '/events/$eventId';

export interface EventStepControl {
  step: EventPaneKey | null;
  isWide: boolean;
  choose: (pane: EventPaneKey) => void;
  close: () => void;
}

export const useEventStep = (): EventStepControl => {
  const isWide = useIsWideScreen();
  const navigate = useNavigate();
  const params = useParams({ from: EVENT_ROUTE_ID });
  const { step } = useSearch({ from: EVENT_ROUTE_ID });
  const chosen = step ?? null;

  const go = (next: EventPaneKey | undefined, replace: boolean): void => {
    void navigate({
      to: EVENT_PATH,
      params,
      search: (previous) => ({ ...previous, step: next }),
      replace,
      resetScroll: false,
    });
  };

  return {
    step: chosen,
    isWide,
    choose: (pane) => {
      go(pane, chosen !== null);
    },
    close: () => {
      go(undefined, true);
    },
  };
};
