import { KkAppShellContent } from './internal/layout/KkAppShellContent';
import { KkAppShellNav } from './internal/layout/KkAppShellNav';
import { KkAppShellRoot } from './internal/layout/KkAppShellRoot';
import { KkAppShellSidebar } from './internal/layout/KkAppShellSidebar';
import { KkAppShellTopBar } from './internal/layout/KkAppShellTopBar';
import { KkAppShellUserBlock } from './internal/layout/KkAppShellUserBlock';
import { KkAppShellNavItem } from './internal/ui/KkAppShellNavItem';
import { KkAppShellPageHeader } from './internal/ui/KkAppShellPageHeader';

export const KkAppShell = Object.assign(KkAppShellRoot, {
  Sidebar: KkAppShellSidebar,
  TopBar: KkAppShellTopBar,
  Nav: KkAppShellNav,
  NavItem: KkAppShellNavItem,
  UserBlock: KkAppShellUserBlock,
  Content: KkAppShellContent,
  PageHeader: KkAppShellPageHeader,
});
