import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import { useLanding } from '@/features/write/hooks/use-landing';
import { toIsoDay } from '@/lib/day';
import { useRolesQuery } from '../api';
import type { RightGroup } from '../roles-hub';
import { toActiveRoles, toArchivedRoles, toRightEntries, toRightGroups } from '../roles-hub';
import { HUB_PATH, RIGHT_GROUP_DEFINITIONS } from '../roles-hub-copy';
import type { RolePaneTab, RoleSummary, RolesResponse, RolesView } from '../schemas';
import { RolesViewSchema } from '../schemas';
import type { HoldingFormTargetControl } from './use-holding-form-target';
import { useHoldingFormTarget } from './use-holding-form-target';

const HUB_ROUTE_ID = '/_app/manage/roles';
const NO_ROLES: readonly RoleSummary[] = [];
const NO_KEYS: readonly string[] = [];

export interface PaneRequest {
  tab: RolePaneTab | null;
  nonce: number;
}

export interface RolesHubControl {
  query: UseQueryResult<RolesResponse, Error>;
  today: string;
  roles: readonly RoleSummary[];
  catalogue: readonly string[];
  list: RoleSummary[];
  rightGroups: RightGroup[];
  view: RolesView;
  archived: RoleSummary[];
  isWide: boolean;
  highlightedKey: string | null;
  selected: RoleSummary | null;
  request: PaneRequest;
  form: HoldingFormTargetControl;
  chooseView: (view: string) => void;
  open: (roleId: number, tab?: RolePaneTab) => void;
  closePane: () => void;
  reload: () => void;
}

export const useRolesHub = (): RolesHubControl => {
  const query = useRolesQuery();
  const search = useSearch({ from: HUB_ROUTE_ID });
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const form = useHoldingFormTarget();
  const { highlightedKey } = useLanding();
  const [request, setRequest] = useState<PaneRequest>({ tab: null, nonce: 0 });
  const today = toIsoDay(new Date());
  const roles = query.data?.roles ?? NO_ROLES;
  const catalogue = query.data?.permissionKeys ?? NO_KEYS;
  const view = search.lens ?? 'roles';
  const selectedId = search.role ?? null;

  const chooseView = (next: string): void => {
    const parsed = RolesViewSchema.safeParse(next);

    if (!parsed.success) {
      return;
    }

    void navigate({
      to: HUB_PATH,
      search: {
        role: search.role,
        lens: parsed.data === 'roles' ? undefined : parsed.data,
      },
      replace: true,
      resetScroll: false,
    });
  };

  const open = (roleId: number, tab?: RolePaneTab): void => {
    form.close();
    setRequest((current) => ({ tab: tab ?? null, nonce: current.nonce + 1 }));
    void navigate({
      to: HUB_PATH,
      search: { role: roleId, lens: search.lens },
      replace: true,
      resetScroll: false,
    });
  };

  const closePane = (): void => {
    form.close();
    void navigate({
      to: HUB_PATH,
      search: { lens: search.lens },
      replace: true,
      resetScroll: false,
    });
  };

  const selected = roles.find((role) => role.roleId === selectedId) ?? null;

  useCloseOnEscape(isWide && selected !== null && form.target === null, closePane);

  return {
    query,
    today,
    roles,
    catalogue,
    list: toActiveRoles(roles),
    rightGroups: toRightGroups(toRightEntries(roles, catalogue), RIGHT_GROUP_DEFINITIONS),
    view,
    archived: toArchivedRoles(roles),
    isWide,
    highlightedKey,
    selected,
    request,
    form,
    chooseView,
    open,
    closePane,
    reload: () => {
      void query.refetch();
    },
  };
};
