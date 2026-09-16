import type { KkNoticeLabels } from '@furria/ui';
import { KkNoticeProvider, KkSheetProvider, KkShell } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { APP_DESTINATIONS } from '../app-sections';
import { useScreenTrail } from '../hooks/use-screen-trail';
import { useSheetManager } from '../hooks/use-sheet-manager';
import { useSystemNotice } from '../hooks/use-system-notice';
import {
  NOTICE_COLLAPSE_LABEL,
  NOTICE_DISMISS_LABEL,
  NOTICE_EXPAND_LABEL,
} from '../session-messages';

const NOTICE_LABELS: KkNoticeLabels = {
  dismiss: NOTICE_DISMISS_LABEL,
  expand: NOTICE_EXPAND_LABEL,
  collapse: NOTICE_COLLAPSE_LABEL,
};

export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const journey = useScreenTrail();
  const sheets = useSheetManager();
  const systemNotice = useSystemNotice();

  return (
    <KkNoticeProvider labels={NOTICE_LABELS} systemNotice={systemNotice}>
      <KkSheetProvider
        openSheetId={sheets.openSheetId}
        onOpen={sheets.onOpen}
        onClose={sheets.onClose}
      >
        <KkShell
          link={Link}
          destinations={APP_DESTINATIONS}
          path={journey.path}
          move={journey.move}
        >
          {children}
        </KkShell>
      </KkSheetProvider>
    </KkNoticeProvider>
  );
};
