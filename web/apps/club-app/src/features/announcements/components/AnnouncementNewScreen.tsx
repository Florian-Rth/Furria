import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { AnnouncementDenied } from './AnnouncementDenied';
import { AnnouncementEditor } from './AnnouncementEditor';

const TITLE = 'Aushang hinzufügen';

export const AnnouncementNewScreen: FC = () => {
  const { has } = usePermissions();

  if (!has(PERMISSION_KEYS.announcementsPost)) {
    return <AnnouncementDenied title={TITLE} />;
  }

  return <AnnouncementEditor announcement={null} />;
};
