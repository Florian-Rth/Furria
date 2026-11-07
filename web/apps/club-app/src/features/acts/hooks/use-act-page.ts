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
import { useNavigate } from '@tanstack/react-router';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { useActsQuery } from '@/features/running-order/api';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useCloseOnEscape } from '@/lib/use-close-on-escape';
import { SETTINGS_LABEL, STUDIO_MUSIC_LABEL } from '../act-page-copy';
import { actScreenPathOf } from '../act-screens';
import type { ActPageMode } from '../act-studio';
import { actPageModeOf, seesDetailsOf } from '../act-studio';
import { actCardOriginOf } from '../acts-origin';
import type { ActPageSearch, ActStudioResponse, StudioEvening, StudioTraining } from '../schemas';
import type { ActLoad } from './use-act-load';
import { useActLoad } from './use-act-load';

const NO_ACTS: readonly CatalogueAct[] = [];
const SIDE_OPEN_SPAN: KkMasterDetailSpan = 7;
const FULL_SPAN: KkMasterDetailSpan = 12;

export interface ActPageState {
  load: ActLoad;
  actId: number | null;
  mode: ActPageMode;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  actions: KkScreenActions | undefined;
  viewerId: number | null;
  search: ActPageSearch;
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
  openEvening: (eventId: number) => void;
  closeEvening: () => void;
  closeRoll: () => void;
  startTraining: (calendarEntryId: number) => void;
  practiseEvening: (eventId: number, edit: boolean) => void;
  reload: () => void;
}

const actionsOf = (
  actions: readonly (KkQuietScreenAction | null)[],
): KkScreenActions | undefined => {
  const shown = actions.filter((action): action is KkQuietScreenAction => action !== null);
  const [first, second] = shown;

  if (first === undefined) {
    return undefined;
  }

  return second === undefined ? [first] : [first, second];
};

export const useActPage = (rawActId: string, search: ActPageSearch): ActPageState => {
  const load = useActLoad(rawActId, search);
  const { actId, query, act, name } = load;
  const plans = usePlansRunningOrder();
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const canEditSettings = query.data?.viewer.canEditSettings === true;
  const isSettingsOpen = canEditSettings && search.settings === true;
  const catalogue = useActsQuery(act?.sessionYear ?? null, isSettingsOpen);

  const studio = query.data?.studio;
  const viewer = query.data?.viewer;
  const { canEditStudio } = load;
  const seesDetails = viewer === undefined || seesDetailsOf(viewer);
  const mode = actPageModeOf(studio, { canEditStudio, seesDetails }, search);
  const evening =
    studio?.evenings.find((candidate) => candidate.eventId === search.evening) ?? null;
  const isEveningOpen = mode === 'details' && !isSettingsOpen && canEditStudio && evening !== null;
  const rollTraining =
    studio?.trainings.find((candidate) => candidate.calendarEntryId === search.roll) ?? null;
  const isRollOpen =
    mode === 'details' && !isSettingsOpen && !isEveningOpen && rollTraining !== null;
  const origin = originSearchOf(search);

  const showSettings = (settings: true | undefined): void => {
    void navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        view: 'details',
        settings,
        evening: undefined,
        roll: undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  };
  const showEvening = (eventId: number | undefined): void => {
    void navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        view: 'details',
        settings: undefined,
        evening: eventId,
        roll: undefined,
      }),
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

  const closeEvening = (): void => {
    showEvening(undefined);
  };
  const closeRoll = (): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, roll: undefined }),
      replace: true,
      resetScroll: false,
    });
  };
  const openScreen = (href: string): void => {
    void navigate({ to: href, search: origin, resetScroll: true });
  };

  useCloseOnEscape(isWide && isSettingsOpen, closeSettings);
  useCloseOnEscape(isWide && isEveningOpen, closeEvening);
  useCloseOnEscape(isWide && isRollOpen, closeRoll);

  const practisable = canPractise(studio ?? null);
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
  const sidePaneOpen = isSettingsOpen || isEveningOpen || isRollOpen;
  const settingsAction: KkQuietScreenAction = {
    id: 'settings',
    label: SETTINGS_LABEL,
    icon: 'edit',
    onSelect: openSettings,
  };
  const detailActions = actionsOf([
    practisable || canEditStudio ? practiceAction : null,
    canEditSettings ? settingsAction : null,
  ]);
  const shownOrigin: KkScreenOrigin =
    actId === null || mode === 'card' ? load.away : actCardOriginOf(actId, search, name);

  return {
    load,
    actId,
    query,
    title: name,
    origin: shownOrigin,
    mode,
    actions: mode === 'card' && query.data?.studio !== null ? undefined : detailActions,
    viewerId: load.viewerId,
    search,
    canEditStudio,
    evening,
    rollTraining,
    isRollOpen,
    isSettingsOpen,
    isEveningOpen,
    isWide,
    masterSpan: isWide && sidePaneOpen ? SIDE_OPEN_SPAN : FULL_SPAN,
    acts: catalogue.data?.acts ?? NO_ACTS,
    fixedGroupId: plans ? null : (act?.group?.groupId ?? null),
    closeSettings,
    openEvening: showEvening,
    closeEvening,
    closeRoll,
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
