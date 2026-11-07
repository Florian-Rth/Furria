import type {
  KkQuietScreenAction,
  KkScreenActions,
  KkScreenOrigin,
} from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { actDetailsPathOf } from '../act-details';
import { SETTINGS_LABEL, STUDIO_MUSIC_LABEL } from '../act-page-copy';
import { shownActionsOf } from '../act-screen-actions';
import { actScreenPathOf } from '../act-screens';
import type { ActPageSearch } from '../schemas';
import type { ActLoad } from './use-act-load';
import { useActLoad } from './use-act-load';

export interface ActHubPageState {
  load: ActLoad;
  actId: number | null;
  title: string;
  origin: KkScreenOrigin;
  outlineActions: KkScreenActions | undefined;
  viewerId: number | null;
  search: ActPageSearch;
}

export const useActHubPage = (rawActId: string, search: ActPageSearch): ActHubPageState => {
  const load = useActLoad(rawActId, search);
  const { actId, canEditStudio } = load;
  const navigate = useNavigate();
  const canEditSettings = load.query.data?.viewer.canEditSettings === true;
  const origin = originSearchOf(search);

  const open = (href: string): void => {
    void navigate({ to: href, search: origin, resetScroll: true });
  };
  const musicAction: KkQuietScreenAction = {
    id: 'practice',
    label: STUDIO_MUSIC_LABEL,
    icon: 'music',
    onSelect: () => {
      if (actId !== null) {
        open(actScreenPathOf(actId, { kind: 'practice', eventId: null }));
      }
    },
  };
  const settingsAction: KkQuietScreenAction = {
    id: 'settings',
    label: SETTINGS_LABEL,
    icon: 'edit',
    onSelect: () => {
      if (actId !== null) {
        open(actDetailsPathOf(actId, { kind: 'settings' }));
      }
    },
  };

  return {
    load,
    actId,
    title: load.name,
    origin: load.away,
    outlineActions: shownActionsOf([
      canEditStudio ? musicAction : null,
      canEditSettings ? settingsAction : null,
    ]),
    viewerId: load.viewerId,
    search,
  };
};
