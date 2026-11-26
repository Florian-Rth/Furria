import { usePermissions } from '@/features/session/hooks/use-permissions';
import { asksForMotion } from '../motion-access';
import type { BoardPanel } from '../schemas';
import type { ConfettiGlobe } from './use-confetti-globe';
import type { StartView } from './use-start-view';

export type StartHelpPanelKind = BoardPanel['kind'];

export interface StartHelpViewer {
  greets: boolean;
  shakes: boolean;
  asksForMotion: boolean;
  showsWeek: boolean;
  invitesToClubGroup: boolean;
  panels: ReadonlySet<StartHelpPanelKind>;
}

const NO_PANELS: ReadonlySet<StartHelpPanelKind> = new Set();

export const useStartHelpViewer = (
  view: StartView,
  globe: ConfettiGlobe,
  showsWeek: boolean,
): StartHelpViewer => {
  const { isManagingLogin } = usePermissions();
  const board = view.screen === 'board' ? view.board : null;
  const greets = !isManagingLogin;
  const shakes = greets && globe.available && !globe.still;

  return {
    greets,
    shakes,
    asksForMotion: shakes && asksForMotion(globe.access),
    showsWeek,
    invitesToClubGroup: board !== null && board.start.clubGroupInviteLink !== null,
    panels: board === null ? NO_PANELS : new Set(board.panels.map((panel) => panel.kind)),
  };
};
