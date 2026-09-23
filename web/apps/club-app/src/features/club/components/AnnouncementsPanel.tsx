import type { KkPanelAction } from '@furria/ui';
import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection, KkRule } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { Fragment } from 'react';
import { ANNOUNCEMENTS_PATH, useMeQuery, usePermissions } from '@/features/session';
import { isAnnouncementNew } from '@/lib/announcements';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useClubHubQuery } from '../api';
import { AnnouncementCard } from './AnnouncementCard';

const PANEL_TITLE = 'Aushang';
const ALL_ANNOUNCEMENTS_LABEL = 'Alle Aushänge';
const POST_ANNOUNCEMENT_LABEL = 'Aushang schreiben';
const NOTHING_POSTED_TITLE = 'BRETT LEER';
const NOTHING_POSTED_LINE = 'Neue Aushänge erscheinen hier.';
const NEW_ANNOUNCEMENT_ROUTE = '/announcements/new';

export const AnnouncementsPanel: FC = () => {
  const clubHub = useClubHubQuery();
  const me = useMeQuery();
  const { has } = usePermissions();

  const announcements = clubHub.data?.announcements;
  const canPost = has(PERMISSION_KEYS.announcementsPost);

  if (announcements === undefined) {
    return null;
  }
  if (announcements.newest.length === 0 && !canPost) {
    return null;
  }

  const cards = announcements.newest.map((announcement, index) => {
    const separator = index === 0 ? null : <KkRule weight="hair" />;

    return (
      <Fragment key={announcement.announcementId}>
        {separator}
        <AnnouncementCard
          announcement={announcement}
          isNew={isAnnouncementNew(announcement.publishedAt, me.data?.lastSeenAnnouncementAt)}
        />
      </Fragment>
    );
  });

  const body =
    cards.length === 0 ? (
      <KkEmptyState size="panel" title={NOTHING_POSTED_TITLE} description={NOTHING_POSTED_LINE} />
    ) : (
      cards
    );

  const postButton = canPost ? (
    <KkButton
      variant="outlined"
      fullWidth
      component={Link}
      to={NEW_ANNOUNCEMENT_ROUTE}
      startIcon={<KkIcon name="add" size="small" />}
    >
      {POST_ANNOUNCEMENT_LABEL}
    </KkButton>
  ) : null;

  const openAll: KkPanelAction | undefined =
    announcements.totalCount > 0
      ? {
          label: ALL_ANNOUNCEMENTS_LABEL,
          emphasis: 'quiet',
          component: Link,
          to: ANNOUNCEMENTS_PATH,
        }
      : undefined;

  return (
    <KkPanelSection title={PANEL_TITLE} action={openAll}>
      <KkPanel variant="block">
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          {body}
          {postButton}
        </Stack>
      </KkPanel>
    </KkPanelSection>
  );
};
