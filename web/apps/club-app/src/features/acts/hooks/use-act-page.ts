import type { KkMasterDetailSpan } from '@furria/ui/KkMasterDetailMaster';
import type { KkScreenActions, KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import { useActsQuery } from '@/features/running-order/api';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { ACT_FALLBACK_TITLE, SETTINGS_LABEL } from '../act-page-copy';
import { actPageOriginOf, actPageReturnOf } from '../acts-origin';
import { useActStudioQuery } from '../api';
import type { ActPageSearch, ActStudioResponse } from '../schemas';

const NO_ACTS: readonly CatalogueAct[] = [];
const SIDE_OPEN_SPAN: KkMasterDetailSpan = 7;
const FULL_SPAN: KkMasterDetailSpan = 12;

export interface ActPageState {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  actions: KkScreenActions | undefined;
  viewerId: number | null;
  isSettingsOpen: boolean;
  isWide: boolean;
  masterSpan: KkMasterDetailSpan;
  acts: readonly CatalogueAct[];
  fixedGroupId: number | null;
  closeSettings: () => void;
  reload: () => void;
}

export const useActPage = (rawActId: string, search: ActPageSearch): ActPageState => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const plans = usePlansRunningOrder();
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const act = query.data?.act ?? null;
  const canEditSettings = query.data?.viewer.canEditSettings === true;
  const isSettingsOpen = canEditSettings && search.settings === true;
  const catalogue = useActsQuery(act?.sessionYear ?? null, isSettingsOpen);

  const showSettings = (settings: true | undefined): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, settings }),
      replace: true,
      resetScroll: false,
    });
  };
  const openSettings = (): void => {
    showSettings(true);
  };
  const closeSettings = (): void => {
    showSettings(undefined);
  };

  useCloseOnEscape(isWide && isSettingsOpen, closeSettings);

  return {
    actId,
    query,
    title: act?.name ?? ACT_FALLBACK_TITLE,
    origin: actPageOriginOf(actPageReturnOf(search, act), act),
    actions: canEditSettings
      ? [{ id: 'settings', label: SETTINGS_LABEL, icon: 'edit', onSelect: openSettings }]
      : undefined,
    viewerId: me.data?.person?.id ?? null,
    isSettingsOpen,
    isWide,
    masterSpan: isWide && isSettingsOpen ? SIDE_OPEN_SPAN : FULL_SPAN,
    acts: catalogue.data?.acts ?? NO_ACTS,
    fixedGroupId: plans ? null : (act?.group?.groupId ?? null),
    closeSettings,
    reload: () => {
      void query.refetch();
    },
  };
};
