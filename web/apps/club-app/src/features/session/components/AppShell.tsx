import type { KkNoticeLabels } from '@furria/ui/KkNotice';
import { KkNoticeProvider } from '@furria/ui/KkNotice';
import { KkSheetProvider } from '@furria/ui/KkSheetProvider';
import { KkShell } from '@furria/ui/KkShell';
import type { ParsedLocation } from '@tanstack/react-router';
import { Link, useLocation } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { useAppDestinations } from '../hooks/use-app-destinations';
import { useOriginReturn } from '../hooks/use-origin-return';
import { useScreenTrail } from '../hooks/use-screen-trail';
import { useSheetManager } from '../hooks/use-sheet-manager';
import { useShellProfile } from '../hooks/use-shell-profile';
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

const pathnameOf = (location: ParsedLocation): string => location.pathname;

export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const screen = useLocation({ select: pathnameOf });
  const journey = useScreenTrail();
  const sheets = useSheetManager();
  const returnToOrigin = useOriginReturn();
  const systemNotice = useSystemNotice();
  const destinations = useAppDestinations();
  const profile = useShellProfile();

  return (
    <KkNoticeProvider labels={NOTICE_LABELS} systemNotice={systemNotice} screen={screen}>
      <KkSheetProvider
        openSheetId={sheets.openSheetId}
        onOpen={sheets.onOpen}
        onClose={sheets.onClose}
      >
        <KkShell
          link={Link}
          goBackTo={returnToOrigin}
          destinations={destinations}
          profile={profile}
          path={journey.path}
          move={journey.move}
        >
          <RequireMe>{children}</RequireMe>
        </KkShell>
      </KkSheetProvider>
    </KkNoticeProvider>
  );
};
