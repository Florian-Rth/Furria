import type { KkQuietScreenAction, KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import type { CardLinkSearch } from '@/features/act-card/act-card-paths';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { useSpotBehind } from '@/lib/use-spot-behind';
import { ACT_CARD_LABEL } from '../act-page-copy';
import type { ActScreen } from '../act-screens';
import { actScreenPathOf } from '../act-screens';
import type { ActScreenAccess, ActStudioScreen } from '../act-studio';
import { actScreenAccessOf } from '../act-studio';
import { actCardLinkOf, actPagePathOf, playerOriginOf } from '../acts-origin';
import type { ActScreenSearch } from '../schemas';
import type { ActLoad } from './use-act-load';
import { useActLoad } from './use-act-load';

export interface ActScreenPage {
  load: ActLoad;
  origin: KkScreenOrigin;
  actions: readonly [KkQuietScreenAction];
  access: ActScreenAccess | null;
  originSearch: CardLinkSearch;
  hubPath: string | null;
  open: (screen: ActScreen) => void;
  swap: (screen: ActScreen) => void;
}

export const useActScreenPage = (
  rawActId: string,
  search: ActScreenSearch,
  screen: ActStudioScreen,
  eventId: number | null,
): ActScreenPage => {
  const load = useActLoad(rawActId, search);
  const navigate = useNavigate();
  const behind = useSpotBehind();
  const { actId, name } = load;
  const originSearch = originSearchOf(search);
  const studio = load.query.data?.studio;
  const hubPath = actId === null ? null : actPagePathOf(actId);
  const go = (target: ActScreen, replace: boolean): void => {
    if (actId !== null) {
      void navigate({
        to: actScreenPathOf(actId, target),
        search: originSearch,
        replace,
        resetScroll: true,
      });
    }
  };
  const cardLink = actId === null ? undefined : actCardLinkOf(actId, search);
  const cardAction: KkQuietScreenAction = {
    id: 'details',
    label: ACT_CARD_LABEL,
    icon: 'info',
    link: cardLink,
    onSelect: () => {
      if (cardLink !== undefined) {
        void navigate({ ...cardLink, resetScroll: true });
      }
    },
  };

  return {
    load,
    origin:
      actId === null ? load.away : playerOriginOf(actId, search, eventId, behind, load.away, name),
    actions: [cardAction],
    access: studio === undefined ? null : actScreenAccessOf(studio, load.canEditStudio, screen),
    originSearch,
    hubPath,
    open: (target) => {
      go(target, false);
    },
    swap: (target) => {
      go(target, true);
    },
  };
};
