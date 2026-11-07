import { parsePositiveId } from '@/lib/positive-id';
import { seesDetailsOf } from './act-studio';
import type { ActViewer } from './schemas';

export const ACT_DETAILS_PATH = '/acts/$actId/details';
export const ACT_SETTINGS_PANE_PATH = '/acts/$actId/details/settings';
export const ACT_EVENING_PANE_PATH = '/acts/$actId/details/evenings/$eventId';
export const ACT_ROLL_PANE_PATH = '/acts/$actId/details/trainings/$trainingId/roll';

const PANE_ROUTE_PREFIX = '/_app/acts_/$actId_/details/';

export type ActDetailsPane =
  | { kind: 'settings' }
  | { kind: 'evening'; eventId: number }
  | { kind: 'roll'; trainingId: number };

export type ActDetailsAccess = 'open' | 'details' | 'hub';

export interface ActDetailsLink {
  to: string;
  params: Record<string, string>;
}

export interface ActDetailsPaneMatch {
  routeId: string;
  params: Partial<Record<string, string>>;
}

export interface ActDetailsStudio {
  evenings: readonly { eventId: number }[];
  trainings: readonly { calendarEntryId: number }[];
}

export const actDetailsLinkOf = (actId: number, pane: ActDetailsPane | null): ActDetailsLink => {
  const id = String(actId);

  if (pane === null) {
    return { to: ACT_DETAILS_PATH, params: { actId: id } };
  }

  switch (pane.kind) {
    case 'settings':
      return { to: ACT_SETTINGS_PANE_PATH, params: { actId: id } };
    case 'evening':
      return { to: ACT_EVENING_PANE_PATH, params: { actId: id, eventId: String(pane.eventId) } };
    case 'roll':
      return {
        to: ACT_ROLL_PANE_PATH,
        params: { actId: id, trainingId: String(pane.trainingId) },
      };
  }
};

export const actDetailsPathOf = (actId: number, pane: ActDetailsPane | null): string => {
  const link = actDetailsLinkOf(actId, pane);

  return Object.entries(link.params).reduce(
    (path, [name, value]) => path.replace(`$${name}`, value),
    link.to,
  );
};

const eveningPaneOf = (eventId: number | null): ActDetailsPane | null =>
  eventId === null ? null : { kind: 'evening', eventId };

const rollPaneOf = (trainingId: number | null): ActDetailsPane | null =>
  trainingId === null ? null : { kind: 'roll', trainingId };

export const actDetailsPaneOf = (match: ActDetailsPaneMatch | undefined): ActDetailsPane | null => {
  if (match === undefined) {
    return null;
  }

  switch (match.routeId.replace(PANE_ROUTE_PREFIX, '')) {
    case 'settings':
      return { kind: 'settings' };
    case 'evenings/$eventId':
      return eveningPaneOf(parsePositiveId(match.params.eventId));
    case 'trainings/$trainingId/roll':
      return rollPaneOf(parsePositiveId(match.params.trainingId));
    default:
      return null;
  }
};

const paneExists = (pane: ActDetailsPane, studio: ActDetailsStudio | null): boolean => {
  switch (pane.kind) {
    case 'settings':
      return true;
    case 'evening':
      return studio?.evenings.some((evening) => evening.eventId === pane.eventId) === true;
    case 'roll':
      return (
        studio?.trainings.some((training) => training.calendarEntryId === pane.trainingId) === true
      );
  }
};

const mayOpenPane = (pane: ActDetailsPane, viewer: ActViewer): boolean => {
  switch (pane.kind) {
    case 'settings':
      return viewer.canEditSettings;
    case 'evening':
      return viewer.canEditStudio;
    case 'roll':
      return true;
  }
};

export const actDetailsAccessOf = (
  viewer: ActViewer,
  studio: ActDetailsStudio | null,
  pane: ActDetailsPane | null,
): ActDetailsAccess => {
  if (!seesDetailsOf(viewer)) {
    return 'hub';
  }
  if (pane === null) {
    return 'open';
  }

  return mayOpenPane(pane, viewer) && paneExists(pane, studio) ? 'open' : 'details';
};
