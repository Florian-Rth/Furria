import { KkAppShellCurtain } from './internal/layout/KkAppShellCurtain';
import { KkAppShellCurtainHead } from './internal/layout/KkAppShellCurtainHead';
import { KkAppShellMain } from './internal/layout/KkAppShellMain';
import { KkAppShellMasthead } from './internal/layout/KkAppShellMasthead';
import { KkAppShellNav } from './internal/layout/KkAppShellNav';
import { KkAppShellRail } from './internal/layout/KkAppShellRail';
import { KkAppShellRailHead } from './internal/layout/KkAppShellRailHead';
import { KkAppShellRoot } from './internal/layout/KkAppShellRoot';
import { KkAppShellSheet } from './internal/layout/KkAppShellSheet';
import { KkAppShellStage } from './internal/layout/KkAppShellStage';
import { KkAppShellStageHead } from './internal/layout/KkAppShellStageHead';
import { KkAppShellUserRow } from './internal/layout/KkAppShellUserRow';
import { KkAppShellBackLink } from './internal/ui/KkAppShellBackLink';
import { KkAppShellCurtainAction } from './internal/ui/KkAppShellCurtainAction';
import { KkAppShellCurtainClose } from './internal/ui/KkAppShellCurtainClose';
import { KkAppShellGreeting } from './internal/ui/KkAppShellGreeting';
import { KkAppShellIdentity } from './internal/ui/KkAppShellIdentity';
import { KkAppShellMenuButton } from './internal/ui/KkAppShellMenuButton';
import { KkAppShellNavItem } from './internal/ui/KkAppShellNavItem';
import { KkAppShellPageLead } from './internal/ui/KkAppShellPageLead';
import { KkAppShellPageTitle } from './internal/ui/KkAppShellPageTitle';

export const KkAppShell = Object.assign(KkAppShellRoot, {
  Rail: KkAppShellRail,
  RailHead: KkAppShellRailHead,
  UserRow: KkAppShellUserRow,
  Main: KkAppShellMain,
  Stage: KkAppShellStage,
  StageHead: KkAppShellStageHead,
  Masthead: KkAppShellMasthead,
  Sheet: KkAppShellSheet,
  Nav: KkAppShellNav,
  NavItem: KkAppShellNavItem,
  MenuButton: KkAppShellMenuButton,
  Curtain: KkAppShellCurtain,
  CurtainHead: KkAppShellCurtainHead,
  CurtainClose: KkAppShellCurtainClose,
  CurtainAction: KkAppShellCurtainAction,
  Greeting: KkAppShellGreeting,
  PageTitle: KkAppShellPageTitle,
  PageLead: KkAppShellPageLead,
  BackLink: KkAppShellBackLink,
  Identity: KkAppShellIdentity,
});
