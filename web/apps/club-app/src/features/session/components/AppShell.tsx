import { KkAppShell, KkBrandLockup, KkEyebrow, KkToastProvider } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { useLocation } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { sessionAt } from '@/lib/club';
import { resolveSectionTitle } from '../app-sections';
import { PageHeaderContext } from '../page-header-context';
import { AppNav } from './AppNav';
import { AppSignOutButton } from './AppSignOutButton';
import { AppUserLink } from './AppUserLink';

const TOAST_DISMISS_LABEL = 'Schließen';

export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null);
  const session = sessionAt(new Date());
  const sectionTitle = resolveSectionTitle(location.pathname);
  const sessionLabel = `Session ${session.yearsLabel}`;
  const railKicker = `Club-App · ${sessionLabel}`;

  return (
    <KkToastProvider dismissLabel={TOAST_DISMISS_LABEL}>
      <PageHeaderContext.Provider value={headerContainer}>
        <KkAppShell>
          <KkAppShell.Rail>
            <KkAppShell.RailHead>
              <KkBrandLockup size="sm" eyebrow={railKicker} />
            </KkAppShell.RailHead>
            <AppNav />
            <KkAppShell.UserRow>
              <AppUserLink />
              <AppSignOutButton />
            </KkAppShell.UserRow>
          </KkAppShell.Rail>

          <KkAppShell.Main>
            <KkAppShell.Stage>
              <KkAppShell.Masthead>
                <KkAppShell.Wordmark placement="stage" />
                <KkEyebrow tone="muted">{sessionLabel}</KkEyebrow>
              </KkAppShell.Masthead>
              <Stack ref={setHeaderContainer} sx={{ minWidth: 0 }} />
            </KkAppShell.Stage>
            <KkAppShell.Sheet>{children}</KkAppShell.Sheet>
          </KkAppShell.Main>

          <KkAppShell.MenuButton label={sectionTitle} />
          <KkAppShell.Curtain>
            <KkAppShell.CurtainHead>
              <AppUserLink />
              <KkAppShell.CurtainClose />
            </KkAppShell.CurtainHead>
            <AppNav />
            <KkAppShell.CurtainFooter>
              <KkAppShell.CurtainAction icon="settings" label="Einstellungen" disabled />
              <AppSignOutButton />
            </KkAppShell.CurtainFooter>
          </KkAppShell.Curtain>
        </KkAppShell>
      </PageHeaderContext.Provider>
    </KkToastProvider>
  );
};
