import { seesDetailsOf } from './act-studio';
import type { ActViewer } from './schemas';

export const ACT_DETAILS_PATH = '/acts/$actId/details';
export const ACT_SETTINGS_PANE_PATH = '/acts/$actId/details/settings';

const PANE_ROUTE_PREFIX = '/_app/acts_/$actId_/details/';

export type ActDetailsPane = { kind: 'settings' };

export type ActDetailsAccess = 'open' | 'details' | 'hub';

export interface ActDetailsLink {
  to: string;
  params: Record<string, string>;
}

export interface ActDetailsPaneMatch {
  routeId: string;
  params: Partial<Record<string, string>>;
}

export const actDetailsLinkOf = (actId: number, pane: ActDetailsPane | null): ActDetailsLink => {
  const id = String(actId);

  if (pane === null) {
    return { to: ACT_DETAILS_PATH, params: { actId: id } };
  }

  return { to: ACT_SETTINGS_PANE_PATH, params: { actId: id } };
};

export const actDetailsPathOf = (actId: number, pane: ActDetailsPane | null): string => {
  const link = actDetailsLinkOf(actId, pane);

  return Object.entries(link.params).reduce(
    (path, [name, value]) => path.replace(`$${name}`, value),
    link.to,
  );
};

export const actDetailsPaneOf = (match: ActDetailsPaneMatch | undefined): ActDetailsPane | null => {
  if (match === undefined) {
    return null;
  }

  return match.routeId.replace(PANE_ROUTE_PREFIX, '') === 'settings' ? { kind: 'settings' } : null;
};

export const actDetailsAccessOf = (
  viewer: ActViewer,
  pane: ActDetailsPane | null,
): ActDetailsAccess => {
  if (!seesDetailsOf(viewer)) {
    return 'hub';
  }
  if (pane === null) {
    return 'open';
  }

  return viewer.canEditSettings ? 'open' : 'details';
};
