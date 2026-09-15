import { KkSheetProvider, KkShell, KkToastProvider } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { APP_DESTINATIONS } from '../app-sections';
import { useSheetManager } from '../hooks/use-sheet-manager';

const TOAST_DISMISS_LABEL = 'Schließen';

export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const sheets = useSheetManager();

  return (
    <KkToastProvider dismissLabel={TOAST_DISMISS_LABEL}>
      <KkSheetProvider
        openSheetId={sheets.openSheetId}
        onOpen={sheets.onOpen}
        onClose={sheets.onClose}
      >
        <KkShell link={Link} destinations={APP_DESTINATIONS}>
          {children}
        </KkShell>
      </KkSheetProvider>
    </KkToastProvider>
  );
};
