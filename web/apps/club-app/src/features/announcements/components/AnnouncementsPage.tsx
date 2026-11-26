import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, CLUB_ORIGIN } from '@/features/session/app-sections';
import { useLanding } from '@/features/write/hooks/use-landing';
import { ANNOUNCEMENTS_TITLE } from '../announcements-labels';
import { useAnnouncementsHelpViewer } from '../hooks/use-announcements-help-viewer';
import { AnnouncementsBody } from './AnnouncementsBody';
import { AnnouncementsHelp } from './AnnouncementsHelp';

export const AnnouncementsPage: FC = () => {
  const { highlightedKey } = useLanding();
  const helpViewer = useAnnouncementsHelpViewer();
  const help = toScreenHelp(<AnnouncementsHelp viewer={helpViewer} />);

  return (
    <KkScreen
      kind="list"
      title={ANNOUNCEMENTS_TITLE}
      origin={CLUB_ORIGIN}
      help={help}
      header={<KkTitleHeader title={ANNOUNCEMENTS_TITLE} />}
      handover={AREA_HANDOVERS.announcements}
    >
      <AnnouncementsBody highlightedKey={highlightedKey} />
    </KkScreen>
  );
};
