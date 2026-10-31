import type { KkMasterDetailSpan } from '@furria/ui/KkMasterDetailMaster';
import type {
  KkQuietScreenAction,
  KkScreenActions,
  KkScreenOrigin,
} from '@furria/ui/screen-declaration';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PRACTICE_LABEL } from '@/features/act-practice/practice-copy';
import { eveningCastOf } from '@/features/act-studio/studio-evening';
import { TRAINING_LABEL } from '@/features/act-training/training-copy';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import { useActsQuery } from '@/features/running-order/api';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import type { CastPerson, CatalogueAct } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import type { BackStackSpot } from '@/lib/back-stack';
import { parsePositiveId } from '@/lib/positive-id';
import { useSpotBehind } from '@/lib/use-spot-behind';
import { toEveningLabel } from '../act-evenings-copy';
import {
  ACT_CARD_LABEL,
  ACT_DETAILS_LABEL,
  ACT_FALLBACK_TITLE,
  SETTINGS_LABEL,
  STUDIO_MUSIC_LABEL,
  STUDIO_OPEN_LABEL,
} from '../act-page-copy';
import type { ActPageMode } from '../act-studio';
import { actPageModeOf, canPractise, seesDetailsOf } from '../act-studio';
import {
  actCardLinkOf,
  actCardOriginOf,
  actDetailsLinkOf,
  actPageOriginOf,
  actPageReturnOf,
  playerOriginOf,
} from '../acts-origin';
import { useActStudioQuery } from '../api';
import type { ActPageSearch, ActStudioResponse, StudioEvening, StudioTraining } from '../schemas';

const NO_ACTS: readonly CatalogueAct[] = [];
const SIDE_OPEN_SPAN: KkMasterDetailSpan = 7;
const FULL_SPAN: KkMasterDetailSpan = 12;

export interface ActPageState {
  actId: number | null;
  mode: ActPageMode;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  actions: KkScreenActions | undefined;
  practiceActions: readonly [KkQuietScreenAction];
  viewerId: number | null;
  search: ActPageSearch;
  canEditStudio: boolean;
  evening: StudioEvening | null;
  training: StudioTraining | null;
  rollTraining: StudioTraining | null;
  isRollOpen: boolean;
  eveningCast: readonly CastPerson[];
  startEditing: boolean;
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
  startTraining: (calendarEntryId: number | undefined) => void;
  practiseEvening: (eventId: number, edit: boolean) => void;
  reload: () => void;
}

const titleOf = (name: string, evening: StudioEvening | null, mode: ActPageMode): string => {
  if (mode === 'training') {
    return `${name} · ${TRAINING_LABEL}`;
  }

  return evening === null || mode !== 'practice' ? name : `${name} · ${toEveningLabel(evening)}`;
};

const originOf = (
  mode: ActPageMode,
  actId: number | null,
  search: ActPageSearch,
  away: KkScreenOrigin,
  behind: BackStackSpot | undefined,
  name: string,
): KkScreenOrigin => {
  if (actId === null || mode === 'card') {
    return away;
  }

  return mode === 'details'
    ? actCardOriginOf(actId, search, name)
    : playerOriginOf(actId, search, behind, away, name);
};

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
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const plans = usePlansRunningOrder();
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const behind = useSpotBehind();
  const act = query.data?.act ?? null;
  const away = actPageOriginOf(actPageReturnOf(search, act), act);
  const canEditSettings = query.data?.viewer.canEditSettings === true;
  const isSettingsOpen = canEditSettings && search.settings === true;
  const catalogue = useActsQuery(act?.sessionYear ?? null, isSettingsOpen);

  const studio = query.data?.studio;
  const viewer = query.data?.viewer;
  const canEditStudio = viewer?.canEditStudio === true;
  const seesDetails = viewer === undefined || seesDetailsOf(viewer);
  const mode = actPageModeOf(studio, { canEditStudio, seesDetails }, search);
  const evening =
    studio?.evenings.find((candidate) => candidate.eventId === search.evening) ?? null;
  const training =
    studio?.trainings.find((candidate) => candidate.calendarEntryId === search.training) ?? null;
  const isEveningOpen = mode === 'details' && !isSettingsOpen && canEditStudio && evening !== null;
  const rollTraining =
    studio?.trainings.find((candidate) => candidate.calendarEntryId === search.roll) ?? null;
  const isRollOpen =
    mode === 'details' && !isSettingsOpen && !isEveningOpen && rollTraining !== null;

  const showView = (view: 'play' | 'details' | undefined): void => {
    void navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        view,
        settings: undefined,
        training: undefined,
        evening: undefined,
        roll: undefined,
      }),
      resetScroll: true,
    });
  };
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

  useCloseOnEscape(isWide && isSettingsOpen, closeSettings);
  useCloseOnEscape(isWide && isEveningOpen, closeEvening);
  useCloseOnEscape(isWide && isRollOpen, closeRoll);

  const cardAction: KkQuietScreenAction = {
    id: 'details',
    label: ACT_CARD_LABEL,
    icon: 'info',
    link: actId === null ? undefined : actCardLinkOf(actId, search),
    onSelect: () => {
      void navigate({
        to: '.',
        search: (previous) => ({
          ...previous,
          view: undefined,
          edit: undefined,
          training: undefined,
          evening: undefined,
          roll: undefined,
          settings: undefined,
        }),
        resetScroll: true,
      });
    },
  };
  const openDetailsAction: KkQuietScreenAction = {
    id: 'details',
    label: ACT_DETAILS_LABEL,
    icon: 'info',
    link: actId === null ? undefined : actDetailsLinkOf(actId, search),
    onSelect: () => {
      showView('details');
    },
  };
  const studioAction: KkQuietScreenAction = {
    id: 'studio',
    label: STUDIO_OPEN_LABEL,
    icon: 'music',
    onSelect: () => {
      void navigate({
        to: '.',
        search: (previous) => ({ ...previous, view: 'play', edit: true }),
        resetScroll: true,
      });
    },
  };
  const practisable = canPractise(studio ?? null);
  const practiceAction: KkQuietScreenAction = {
    id: 'practice',
    label: practisable ? PRACTICE_LABEL : STUDIO_MUSIC_LABEL,
    icon: practisable ? 'play' : 'music',
    onSelect: () => {
      showView('play');
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

  const cardActions = actionsOf([
    seesDetails ? openDetailsAction : null,
    canEditStudio ? studioAction : null,
  ]);
  const name = act?.name ?? ACT_FALLBACK_TITLE;

  return {
    actId,
    query,
    title: titleOf(name, evening, mode),
    origin: originOf(mode, actId, search, away, behind, name),
    mode,
    actions: mode === 'card' ? cardActions : detailActions,
    practiceActions: [cardAction],
    viewerId: me.data?.person?.id ?? null,
    search,
    canEditStudio,
    evening,
    training,
    rollTraining,
    isRollOpen,
    eveningCast: eveningCastOf(act?.cast ?? [], evening?.appearance ?? null),
    startEditing: search.edit === true,
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
      void navigate({
        to: '.',
        search: (previous) => ({
          ...previous,
          view: 'training',
          settings: undefined,
          evening: undefined,
          edit: undefined,
          roll: undefined,
          training: calendarEntryId,
        }),
        resetScroll: true,
      });
    },
    practiseEvening: (eventId, edit) => {
      void navigate({
        to: '.',
        search: (previous) => ({
          ...previous,
          view: 'play',
          settings: undefined,
          roll: undefined,
          evening: eventId,
          edit: edit ? true : undefined,
        }),
        resetScroll: true,
      });
    },
    reload: () => {
      void query.refetch();
    },
  };
};
