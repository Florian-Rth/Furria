import { canPractise } from '@furria/studio/music-timeline';
import { PRACTICE_LABEL } from '@furria/studio/practice-copy';
import type { KkMasterDetailSpan } from '@furria/ui/KkMasterDetailMaster';
import type {
  KkQuietScreenAction,
  KkScreenActions,
  KkScreenOrigin,
} from '@furria/ui/screen-declaration';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useChildMatches, useNavigate } from '@tanstack/react-router';
import type { CardLinkSearch } from '@/features/act-card/act-card-paths';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { useActsQuery } from '@/features/running-order/api';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useCloseOnEscape } from '@/lib/use-close-on-escape';
import type { ActDetailsAccess, ActDetailsPane } from '../act-details';
import { actDetailsAccessOf, actDetailsPaneOf, actDetailsPathOf } from '../act-details';
import { SETTINGS_LABEL, STUDIO_MUSIC_LABEL } from '../act-page-copy';
import { shownActionsOf } from '../act-screen-actions';
import { actScreenPathOf } from '../act-screens';
import { actCardOriginOf, actPagePathOf } from '../acts-origin';
import type { ActScreenSearch, ActStudioResponse, StudioEvening, StudioTraining } from '../schemas';
import type { ActLoad } from './use-act-load';
import { useActLoad } from './use-act-load';

const NO_ACTS: readonly CatalogueAct[] = [];
const SIDE_OPEN_SPAN: KkMasterDetailSpan = 7;
const FULL_SPAN: KkMasterDetailSpan = 12;

export interface ActDetailsPageState {
  load: ActLoad;
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  actions: KkScreenActions | undefined;
  viewerId: number | null;
  search: ActScreenSearch;
  originSearch: CardLinkSearch;
  redirectPath: string | null;
  canEditStudio: boolean;
  evening: StudioEvening | null;
  rollTraining: StudioTraining | null;
  isRollOpen: boolean;
  isSettingsOpen: boolean;
  isEveningOpen: boolean;
  isWide: boolean;
  masterSpan: KkMasterDetailSpan;
  acts: readonly CatalogueAct[];
  fixedGroupId: number | null;
  closeSettings: () => void;
  closeEvening: () => void;
  closeRoll: () => void;
  startTraining: (calendarEntryId: number) => void;
  practiseEvening: (eventId: number, edit: boolean) => void;
  reload: () => void;
}

const redirectPathOf = (actId: number | null, access: ActDetailsAccess | null): string | null => {
  if (actId === null || access === null || access === 'open') {
    return null;
  }

  return access === 'hub' ? actPagePathOf(actId) : actDetailsPathOf(actId, null);
};

export const useActDetailsPage = (
  rawActId: string,
  search: ActScreenSearch,
): ActDetailsPageState => {
  const load = useActLoad(rawActId, search);
  const { actId, query, act, name, canEditStudio } = load;
  const plans = usePlansRunningOrder();
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const childMatches = useChildMatches();
  const data = query.data;
  const studio = data?.studio ?? null;
  const pane: ActDetailsPane | null = actDetailsPaneOf(childMatches[0]);
  const access = data === undefined ? null : actDetailsAccessOf(data.viewer, studio, pane);
  const shownPane = access === 'open' ? pane : null;
  const canEditSettings = data?.viewer.canEditSettings === true;
  const isSettingsOpen = shownPane?.kind === 'settings';
  const catalogue = useActsQuery(act?.sessionYear ?? null, isSettingsOpen);
  const evening =
    shownPane?.kind === 'evening'
      ? (studio?.evenings.find((candidate) => candidate.eventId === shownPane.eventId) ?? null)
      : null;
  const rollTraining =
    shownPane?.kind === 'roll'
      ? (studio?.trainings.find(
          (candidate) => candidate.calendarEntryId === shownPane.trainingId,
        ) ?? null)
      : null;
  const isEveningOpen = evening !== null;
  const isRollOpen = rollTraining !== null;
  const origin = originSearchOf(search);

  const showPane = (target: ActDetailsPane | null): void => {
    if (actId !== null) {
      void navigate({
        to: actDetailsPathOf(actId, target),
        search: origin,
        replace: true,
        resetScroll: false,
      });
    }
  };
  const closePane = (): void => {
    showPane(null);
  };
  const openScreen = (href: string): void => {
    void navigate({ to: href, search: origin, resetScroll: true });
  };

  useCloseOnEscape(isWide && shownPane !== null, closePane);

  const practisable = canPractise(studio);
  const practiceAction: KkQuietScreenAction = {
    id: 'practice',
    label: practisable ? PRACTICE_LABEL : STUDIO_MUSIC_LABEL,
    icon: practisable ? 'play' : 'music',
    onSelect: () => {
      if (actId !== null) {
        openScreen(actScreenPathOf(actId, { kind: 'practice', eventId: null }));
      }
    },
  };
  const settingsAction: KkQuietScreenAction = {
    id: 'settings',
    label: SETTINGS_LABEL,
    icon: 'edit',
    onSelect: () => {
      showPane({ kind: 'settings' });
    },
  };

  return {
    load,
    actId,
    query,
    title: name,
    origin: actId === null ? load.away : actCardOriginOf(actId, search, name),
    actions: shownActionsOf([
      practisable || canEditStudio ? practiceAction : null,
      canEditSettings ? settingsAction : null,
    ]),
    viewerId: load.viewerId,
    search,
    originSearch: origin,
    redirectPath: redirectPathOf(actId, access),
    canEditStudio,
    evening,
    rollTraining,
    isRollOpen,
    isSettingsOpen,
    isEveningOpen,
    isWide,
    masterSpan: isWide && shownPane !== null ? SIDE_OPEN_SPAN : FULL_SPAN,
    acts: catalogue.data?.acts ?? NO_ACTS,
    fixedGroupId: plans ? null : (act?.group?.groupId ?? null),
    closeSettings: closePane,
    closeEvening: closePane,
    closeRoll: closePane,
    startTraining: (calendarEntryId) => {
      if (actId !== null) {
        openScreen(actScreenPathOf(actId, { kind: 'training', trainingId: calendarEntryId }));
      }
    },
    practiseEvening: (eventId, edit) => {
      if (actId !== null) {
        openScreen(actScreenPathOf(actId, { kind: edit ? 'edit' : 'practice', eventId }));
      }
    },
    reload: load.reload,
  };
};
