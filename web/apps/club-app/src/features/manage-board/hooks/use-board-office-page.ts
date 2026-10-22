import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { parsePositiveId } from '@/lib/positive-id';
import { useBoardQuery } from '../api';
import type { BoardOffice, BoardResponse } from '../schemas';
import type { SeatFormTargetControl } from './use-seat-form-target';
import { useSeatFormTarget } from './use-seat-form-target';

const OFFICE_ROUTE_ID = '/_app/manage/board_/$boardOfficeId';
const NO_OFFICES: readonly BoardOffice[] = [];

export interface BoardOfficePageControl {
  query: UseQueryResult<BoardResponse, Error>;
  offices: readonly BoardOffice[];
  office: BoardOffice | null;
  today: string;
  isWide: boolean;
  canManageRoles: boolean;
  form: SeatFormTargetControl;
  reload: () => void;
}

export const useBoardOfficePage = (): BoardOfficePageControl => {
  const { boardOfficeId } = useParams({ from: OFFICE_ROUTE_ID });
  const { has } = usePermissions();
  const query = useBoardQuery(has(PERMISSION_KEYS.boardManage));
  const isWide = useIsWideScreen();
  const form = useSeatFormTarget();
  const id = parsePositiveId(boardOfficeId);
  const offices = query.data?.offices ?? NO_OFFICES;

  return {
    query,
    offices,
    office: offices.find((candidate) => candidate.boardOfficeId === id) ?? null,
    today: toIsoDay(new Date()),
    isWide,
    canManageRoles: has(PERMISSION_KEYS.rolesManage),
    form,
    reload: () => {
      void query.refetch();
    },
  };
};
