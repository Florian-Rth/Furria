import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { useLanding } from '@/features/write/hooks/use-landing';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useBoardQuery } from '../api';
import type { BoardSummary, QueueCounts, QueueItem } from '../board-hub';
import {
  filterQueue,
  toArchivedOffices,
  toBoardSummary,
  toHeldOffices,
  toQueueCounts,
  toQueueItems,
} from '../board-hub';
import { HUB_PATH } from '../board-hub-copy';
import type { BoardFilter, BoardOffice, BoardResponse } from '../schemas';
import type { SeatFormTargetControl } from './use-seat-form-target';
import { useSeatFormTarget } from './use-seat-form-target';

const HUB_ROUTE_ID = '/_app/manage/board';
const NO_OFFICES: readonly BoardOffice[] = [];

export interface BoardHubControl {
  query: UseQueryResult<BoardResponse, Error>;
  today: string;
  offices: readonly BoardOffice[];
  items: QueueItem[];
  counts: QueueCounts;
  summary: BoardSummary;
  filter: BoardFilter;
  held: BoardOffice[];
  archived: BoardOffice[];
  canManageRoles: boolean;
  isWide: boolean;
  highlightedKey: string | null;
  selected: BoardOffice | null;
  form: SeatFormTargetControl;
  chooseFilter: (filter: BoardFilter) => void;
  open: (boardOfficeId: number) => void;
  closePane: () => void;
  reload: () => void;
}

export const useBoardHub = (): BoardHubControl => {
  const query = useBoardQuery();
  const { has } = usePermissions();
  const search = useSearch({ from: HUB_ROUTE_ID });
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const form = useSeatFormTarget();
  const { highlightedKey } = useLanding();
  const today = toIsoDay(new Date());
  const offices = query.data?.offices ?? NO_OFFICES;
  const allItems = toQueueItems(offices, today);
  const filter = search.filter ?? 'all';
  const selectedId = search.office ?? null;

  const chooseFilter = (next: BoardFilter): void => {
    const chosen = next === filter ? undefined : next;

    void navigate({
      to: HUB_PATH,
      search: { office: search.office, filter: chosen === 'all' ? undefined : chosen },
      replace: true,
      resetScroll: false,
    });
  };

  const open = (boardOfficeId: number): void => {
    form.close();
    void navigate({
      to: HUB_PATH,
      search: { office: boardOfficeId, filter: search.filter },
      replace: true,
      resetScroll: false,
    });
  };

  const closePane = (): void => {
    form.close();
    void navigate({
      to: HUB_PATH,
      search: { filter: search.filter },
      replace: true,
      resetScroll: false,
    });
  };

  const selected = offices.find((office) => office.boardOfficeId === selectedId) ?? null;

  useCloseOnEscape(isWide && selected !== null && form.target === null, closePane);

  return {
    query,
    today,
    offices,
    items: filterQueue(allItems, offices, filter),
    counts: toQueueCounts(allItems, offices),
    summary: toBoardSummary(offices, today),
    filter,
    held: toHeldOffices(offices, allItems, filter, today),
    archived: toArchivedOffices(offices),
    canManageRoles: has(PERMISSION_KEYS.rolesManage),
    isWide,
    highlightedKey,
    selected,
    form,
    chooseFilter,
    open,
    closePane,
    reload: () => {
      void query.refetch();
    },
  };
};
