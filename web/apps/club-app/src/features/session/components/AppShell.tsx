import type { KkNoticeLabels } from '@furria/ui';
import { KkNoticeProvider, KkSheetProvider, KkShell } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { useAppDestinations } from '../hooks/use-app-destinations';
import { useOriginReturn } from '../hooks/use-origin-return';
import { useScreenTrail } from '../hooks/use-screen-trail';
import { useSheetManager } from '../hooks/use-sheet-manager';
import { useSystemNotice } from '../hooks/use-system-notice';
import {
  NOTICE_COLLAPSE_LABEL,
  NOTICE_DISMISS_LABEL,
  NOTICE_EXPAND_LABEL,
} from '../session-messages';
import { RequireMe } from './RequireMe';

const NOTICE_LABELS: KkNoticeLabels = {
  dismiss: NOTICE_DISMISS_LABEL,
  expand: NOTICE_EXPAND_LABEL,
  collapse: NOTICE_COLLAPSE_LABEL,
};

export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const journey = useScreenTrail();
  const sheets = useSheetManager();
  const returnToOrigin = useOriginReturn();
  const systemNotice = useSystemNotice();
  const destinations = useAppDestinations();

  return (
    <KkNoticeProvider labels={NOTICE_LABELS} systemNotice={systemNotice}>
      <KkSheetProvider
        openSheetId={sheets.openSheetId}
        onOpen={sheets.onOpen}
        onClose={sheets.onClose}
      >
        <KkShell
          link={Link}
          goBackTo={returnToOrigin}
          destinations={destinations}
          path={journey.path}
          move={journey.move}
        >
          <RequireMe>{children}</RequireMe>
        </KkShell>
      </KkSheetProvider>
    </KkNoticeProvider>
  );
};
