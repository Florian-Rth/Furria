import type { KkPublishAnnouncements } from '../../publish-stamp';
import type { KkPublishCeremonyStage } from '../../use-publish-ceremony';
import { isKkPressBusy } from './press-beats';

export const announcementOf = (
  stage: KkPublishCeremonyStage,
  announcements: KkPublishAnnouncements,
): string => {
  if (stage.failed) {
    return announcements.failed;
  }
  if (stage.stamp !== null) {
    return `${announcements.published} ${stage.stamp.address}`;
  }
  return isKkPressBusy(stage.phase) ? announcements.running : '';
};
