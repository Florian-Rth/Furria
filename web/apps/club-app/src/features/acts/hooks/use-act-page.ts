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
import { parsePositiveId } from '@/lib/positive-id';
import { useSpotBehind } from '@/lib/use-spot-behind';
import { toEveningLabel } from '../act-evenings-copy';
import {
  ACT_FALLBACK_TITLE,
  DETAILS_LABEL,
  SETTINGS_LABEL,
  STUDIO_MUSIC_LABEL,
} from '../act-page-copy';
import type { ActPageMode } from '../act-studio';
import { actPageModeOf, canPractise } from '../act-studio';
import { actPageOriginOf, actPageReturnOf, playerOriginOf } from '../acts-origin';
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
  canEditStudio: boolean;
  evening: StudioEvening | null;
  training: StudioTraining | null;
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
  practiseEvening: (eventId: number, edit: boolean) => void;
  reload: () => void;
}

const titleOf = (name: string, evening: StudioEvening | null, mode: ActPageMode): string => {
  if (mode === 'training') {
    return `${name} · ${TRAINING_LABEL}`;
  }

  return evening === null || mode !== 'practice' ? name : `${name} · ${toEveningLabel(evening)}`;
};

const detailActionsOf = (
  practice: KkQuietScreenAction | null,
  settings: KkQuietScreenAction | null,
): KkScreenActions | undefined => {
  if (practice !== null && settings !== null) {
    return [practice, settings];
  }
  if (practice !== null) {
    return [practice];
  }

  return settings === null ? undefined : [settings];
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
  const canEditStudio = query.data?.viewer.canEditStudio === true;
  const mode = actPageModeOf(studio, canEditStudio, search);
  const evening =
    studio?.evenings.find((candidate) => candidate.eventId === search.evening) ?? null;
  const training =
    studio?.trainings.find((candidate) => candidate.calendarEntryId === search.training) ?? null;
  const isEveningOpen = mode === 'details' && !isSettingsOpen && canEditStudio && evening !== null;

  const showView = (view: 'details' | undefined): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, view, settings: undefined, training: undefined }),
      resetScroll: true,
    });
  };
  const showSettings = (settings: true | undefined): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, view: 'details', settings, evening: undefined }),
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

  useCloseOnEscape(isWide && isSettingsOpen, closeSettings);
  useCloseOnEscape(isWide && isEveningOpen, closeEvening);

  const detailsAction: KkQuietScreenAction = {
    id: 'details',
    label: DETAILS_LABEL,
    icon: 'info',
    onSelect: () => {
      void navigate({
        to: '.',
        search: (previous) => ({
          ...previous,
          view: 'details',
          edit: undefined,
          training: undefined,
        }),
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
      showView(undefined);
    },
  };
  const sidePaneOpen = isSettingsOpen || isEveningOpen;
  const settingsAction: KkQuietScreenAction = {
    id: 'settings',
    label: SETTINGS_LABEL,
    icon: 'edit',
    onSelect: openSettings,
  };
  const detailActions = detailActionsOf(
    practisable || canEditStudio ? practiceAction : null,
    canEditSettings ? settingsAction : null,
  );

  return {
    actId,
    query,
    title: titleOf(act?.name ?? ACT_FALLBACK_TITLE, evening, mode),
    origin:
      mode === 'details' || actId === null ? away : playerOriginOf(actId, search, behind, away),
    mode,
    actions: detailActions,
    practiceActions: [detailsAction],
    viewerId: me.data?.person?.id ?? null,
    canEditStudio,
    evening,
    training,
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
    practiseEvening: (eventId, edit) => {
      void navigate({
        to: '.',
        search: (previous) => ({
          ...previous,
          view: undefined,
          settings: undefined,
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
