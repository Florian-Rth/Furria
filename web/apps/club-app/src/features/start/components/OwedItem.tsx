import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import type { OwedItem as OwedItemFacts } from '../owed-items';
import { OwedAnnouncementAttendance } from './OwedAnnouncementAttendance';
import { OwedAttendance } from './OwedAttendance';
import { OwedPoll } from './OwedPoll';
import { OwedSignUp } from './OwedSignUp';

interface OwedItemProps {
  item: OwedItemFacts;
  board: StartBoard;
}

export const OwedItem: FC<OwedItemProps> = ({ item, board }) => {
  const { host } = item;

  if (item.kind === 'poll') {
    return <OwedPoll host={host} poll={item.poll} board={board} />;
  }
  if (item.kind === 'signUpList') {
    return <OwedSignUp host={host} list={item.list} board={board} />;
  }
  if (host.kind === 'announcement') {
    return <OwedAnnouncementAttendance host={host} board={board} />;
  }

  return <OwedAttendance entry={host.entry} board={board} />;
};
