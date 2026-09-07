import { KkAppShell, KkBrandLockup } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { AppShellNav } from './AppShellNav';
import { AppShellUser } from './AppShellUser';
import { AppShellUserCompact } from './AppShellUserCompact';

export const AppShell: FC<PropsWithChildren> = ({ children }) => (
  <KkAppShell>
    <KkAppShell.Sidebar>
      <KkBrandLockup eyebrow="CLUB-APP" />
      <AppShellNav />
      <AppShellUser />
    </KkAppShell.Sidebar>
    <KkAppShell.TopBar>
      <KkBrandLockup eyebrow="CLUB-APP" />
      <AppShellUserCompact />
    </KkAppShell.TopBar>
    <KkAppShell.Content>{children}</KkAppShell.Content>
  </KkAppShell>
);
