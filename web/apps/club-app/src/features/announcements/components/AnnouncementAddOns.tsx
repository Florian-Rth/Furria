import type { FC } from 'react';
import {
  toAnnouncementAddOnKey,
  toAnnouncementAnswering,
  toAnnouncementClosesAt,
} from '../announcement-add-ons';
import { toAnswerAnchorId } from '../announcement-bulletin';
import type { Announcement } from '../schemas';
import { AnnouncementDetailAddOn } from './AnnouncementDetailAddOn';

interface AnnouncementAddOnsProps {
  announcement: Announcement;
}

export const AnnouncementAddOns: FC<AnnouncementAddOnsProps> = ({ announcement }) => {
  const answering = toAnnouncementAnswering(announcement);
  const closesAt = toAnnouncementClosesAt(announcement.validUntil);

  const addOns = announcement.addOns.map((addOn) => {
    const key = toAnnouncementAddOnKey(addOn);
    const anchorId = toAnswerAnchorId(announcement.announcementId, key);

    return (
      <AnnouncementDetailAddOn
        key={key}
        addOn={addOn}
        announcement={announcement}
        answering={answering}
        closesAt={closesAt}
        anchorId={anchorId}
      />
    );
  });

  return <>{addOns}</>;
};
