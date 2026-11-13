import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { AnnouncementBulletin } from '@/features/announcements/components/AnnouncementBulletin';
import { AnnouncementSheet } from '@/features/announcements/components/AnnouncementSheet';
import { ANNOUNCEMENTS_PATH } from '@/features/session/app-sections';
import { useAnnouncementsPanel } from '../hooks/use-announcements-panel';

const PANEL_TITLE = 'Aushänge';
const ALL_ANNOUNCEMENTS_LABEL = 'Alle Aushänge';
const POST_LABEL = 'Aushang schreiben';
const NOTHING_POSTED_TITLE = 'NOCH NICHTS AM BRETT';
const NOTHING_POSTED_LINE = 'Keine Aushänge.';
const NEW_ANNOUNCEMENT_ROUTE = '/announcements/new';

export const AnnouncementsPanel: FC = () => {
  const panel = useAnnouncementsPanel();

  if (panel === null) {
    return null;
  }

  const bulletins = panel.items.map((item) => (
    <AnnouncementBulletin
      key={item.announcement.announcementId}
      announcement={item.announcement}
      marks={item.marks}
      size={item.size}
      isNew={item.isNew}
    />
  ));

  const body =
    bulletins.length === 0 ? (
      <KkPanel variant="block">
        <KkEmptyState size="panel" title={NOTHING_POSTED_TITLE} description={NOTHING_POSTED_LINE} />
      </KkPanel>
    ) : (
      bulletins
    );

  const postButton = panel.canPost ? (
    <KkButton
      variant="outlined"
      fullWidth
      startIcon={<KkIcon name="add" size="small" />}
      component={Link}
      to={NEW_ANNOUNCEMENT_ROUTE}
    >
      {POST_LABEL}
    </KkButton>
  ) : null;

  const openAll: KkPanelAction | undefined =
    panel.totalCount > 0
      ? {
          label: ALL_ANNOUNCEMENTS_LABEL,
          emphasis: 'quiet',
          component: Link,
          to: ANNOUNCEMENTS_PATH,
        }
      : undefined;

  return (
    <KkPanelSection title={PANEL_TITLE} action={openAll}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        {body}
        {postButton}
      </Stack>
      <AnnouncementSheet announcements={panel.details} />
    </KkPanelSection>
  );
};
