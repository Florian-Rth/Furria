import { KkAppShell, KkBrandLockup, KkEyebrow, KkToastProvider } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { sessionAt } from '@/lib/club';
import { formatSessionNumber } from '@/lib/membership-labels';
import { useSectionTitle } from '../hooks/use-section-title';
import { PageHeaderContext } from '../page-header-context';
import { AppNav } from './AppNav';
import { AppSignOutButton } from './AppSignOutButton';
import { AppUserLink } from './AppUserLink';

const TOAST_DISMISS_LABEL = 'Schließen';

export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null);
  const session = sessionAt(new Date());
  const sectionTitle = useSectionTitle();
  const sessionLabel = `Session ${session.yearsLabel} · ${formatSessionNumber(session.number)}`;
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
                <KkBrandLockup size="sm" />
                <KkEyebrow tone="muted">{sessionLabel}</KkEyebrow>
              </KkAppShell.Masthead>
              <KkAppShell.StageHead ref={setHeaderContainer} />
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
