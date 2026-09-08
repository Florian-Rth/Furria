import { KkAppShellCurtain } from './internal/layout/KkAppShellCurtain';
import { KkAppShellCurtainFooter } from './internal/layout/KkAppShellCurtainFooter';
import { KkAppShellCurtainHead } from './internal/layout/KkAppShellCurtainHead';
import { KkAppShellMain } from './internal/layout/KkAppShellMain';
import { KkAppShellMasthead } from './internal/layout/KkAppShellMasthead';
import { KkAppShellNav } from './internal/layout/KkAppShellNav';
import { KkAppShellRail } from './internal/layout/KkAppShellRail';
import { KkAppShellRailHead } from './internal/layout/KkAppShellRailHead';
import { KkAppShellRoot } from './internal/layout/KkAppShellRoot';
import { KkAppShellSheet } from './internal/layout/KkAppShellSheet';
import { KkAppShellStage } from './internal/layout/KkAppShellStage';
import { KkAppShellUserRow } from './internal/layout/KkAppShellUserRow';
import { KkAppShellCurtainAction } from './internal/ui/KkAppShellCurtainAction';
import { KkAppShellCurtainClose } from './internal/ui/KkAppShellCurtainClose';
import { KkAppShellGreeting } from './internal/ui/KkAppShellGreeting';
import { KkAppShellIdentity } from './internal/ui/KkAppShellIdentity';
import { KkAppShellMenuButton } from './internal/ui/KkAppShellMenuButton';
import { KkAppShellNavItem } from './internal/ui/KkAppShellNavItem';
import { KkAppShellPageTitle } from './internal/ui/KkAppShellPageTitle';
import { KkAppShellWordmark } from './internal/ui/KkAppShellWordmark';

export const KkAppShell = Object.assign(KkAppShellRoot, {
  Rail: KkAppShellRail,
  RailHead: KkAppShellRailHead,
  UserRow: KkAppShellUserRow,
  Main: KkAppShellMain,
  Stage: KkAppShellStage,
  Masthead: KkAppShellMasthead,
  Sheet: KkAppShellSheet,
  Nav: KkAppShellNav,
  NavItem: KkAppShellNavItem,
  MenuButton: KkAppShellMenuButton,
  Curtain: KkAppShellCurtain,
  CurtainHead: KkAppShellCurtainHead,
  CurtainClose: KkAppShellCurtainClose,
  CurtainFooter: KkAppShellCurtainFooter,
  CurtainAction: KkAppShellCurtainAction,
  Wordmark: KkAppShellWordmark,
  Greeting: KkAppShellGreeting,
  PageTitle: KkAppShellPageTitle,
  Identity: KkAppShellIdentity,
});
