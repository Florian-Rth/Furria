import { mentionCardsOfTargets } from '@/features/rich-text/mention-cards';
import type { Announcement } from './schemas';

export interface AnnouncementHelpViewer {
  mayEdit: boolean;
  hasMentions: boolean;
  hasAddOns: boolean;
  hasTakenOver: boolean;
}

export const toAnnouncementHelpViewer = (announcement: Announcement): AnnouncementHelpViewer => ({
  mayEdit: announcement.viewerMayEdit,
  hasMentions: mentionCardsOfTargets(announcement.mentions).size > 0,
  hasAddOns: announcement.addOns.length > 0,
  hasTakenOver: announcement.addOns.some((addOn) => addOn.kind === 'borrowed'),
});
