import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection, KkRule } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link, useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { Fragment } from 'react';
import { ANNOUNCEMENTS_PATH, useMeQuery, usePermissions } from '@/features/session';
import { ANNOUNCEMENT_FORM_SHEET_ID, isAnnouncementNew } from '@/lib/announcements';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useClubHubQuery } from '../api';
import { AnnouncementCard } from './AnnouncementCard';

const PANEL_TITLE = 'Aushang';
const ALL_ANNOUNCEMENTS_LABEL = 'Alle Aushänge';
const POST_ANNOUNCEMENT_LABEL = 'Aushang schreiben';
const NOTHING_POSTED_TITLE = 'BRETT LEER';
const NOTHING_POSTED_LINE = 'Am Brett hängt gerade nichts. Häng den ersten Aushang auf.';

export const AnnouncementsPanel: FC = () => {
  const clubHub = useClubHubQuery();
  const me = useMeQuery();
  const navigate = useNavigate();
  const { has } = usePermissions();

  const announcements = clubHub.data?.announcements;
  const canPost = has(PERMISSION_KEYS.announcementsPost);

  const writeAnnouncement = (): void => {
    void navigate({ to: ANNOUNCEMENTS_PATH, search: { sheet: ANNOUNCEMENT_FORM_SHEET_ID } });
  };

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
      startIcon={<KkIcon name="add" size="small" />}
      onClick={writeAnnouncement}
    >
      {POST_ANNOUNCEMENT_LABEL}
    </KkButton>
  ) : null;

  const openAll =
    announcements.totalCount > 0 ? (
      <KkButton size="small" variant="text" component={Link} to={ANNOUNCEMENTS_PATH}>
        {ALL_ANNOUNCEMENTS_LABEL}
      </KkButton>
    ) : null;

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
