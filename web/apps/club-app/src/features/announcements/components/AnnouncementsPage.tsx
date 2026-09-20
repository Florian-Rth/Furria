import type { KkLoudScreenAction } from '@furria/ui';
import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import {
  ANNOUNCEMENTS_TITLE,
  POST_ANNOUNCEMENT_LABEL,
  toAnnouncementsLead,
} from '../announcements-labels';
import { useAnnouncementsQuery } from '../api';
import { useAnnouncementSheet } from '../hooks/use-announcement-sheet';
import { AnnouncementFormSheet } from './AnnouncementFormSheet';
import { AnnouncementsBody } from './AnnouncementsBody';

const POST_ACTION_ID = 'post-announcement';

export const AnnouncementsPage: FC = () => {
  const announcements = useAnnouncementsQuery();
  const sheet = useAnnouncementSheet();
  const { has } = usePermissions();
  const canPost = has(PERMISSION_KEYS.announcementsPost);

  const lead =
    announcements.data === undefined
      ? undefined
      : toAnnouncementsLead(announcements.data.announcements.length);

  const postAction: KkLoudScreenAction = {
    id: POST_ACTION_ID,
    label: POST_ANNOUNCEMENT_LABEL,
    icon: 'add',
    emphasis: true,
    onSelect: sheet.openPost,
  };
  const actions: readonly [KkLoudScreenAction] | undefined = canPost ? [postAction] : undefined;

  return (
    <KkScreen
      kind="list"
      title={ANNOUNCEMENTS_TITLE}
      origin={CLUB_ORIGIN}
      actions={actions}
      header={<KkTitleHeader title={ANNOUNCEMENTS_TITLE} lead={lead} />}
    >
      <AnnouncementsBody sheet={sheet} />
      <AnnouncementFormSheet sheet={sheet} />
    </KkScreen>
  );
};
