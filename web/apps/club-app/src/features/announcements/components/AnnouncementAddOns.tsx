import type { FC } from 'react';
import {
  toAnnouncementAddOnKey,
  toAnnouncementAnswering,
  toAnnouncementClosesAt,
} from '../announcement-add-ons';
import type { Announcement } from '../schemas';
import { AnnouncementDetailAddOn } from './AnnouncementDetailAddOn';

interface AnnouncementAddOnsProps {
  announcement: Announcement;
}

export const AnnouncementAddOns: FC<AnnouncementAddOnsProps> = ({ announcement }) => {
  const answering = toAnnouncementAnswering(announcement);
  const closesAt = toAnnouncementClosesAt(announcement.validUntil);

  const addOns = announcement.addOns.map((addOn) => (
    <AnnouncementDetailAddOn
      key={toAnnouncementAddOnKey(addOn)}
      addOn={addOn}
      announcement={announcement}
      answering={answering}
      closesAt={closesAt}
    />
  ));

  return <>{addOns}</>;
};
