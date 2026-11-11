import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import type { OwedItem as OwedItemFacts } from '../owed-items';
import { OwedAttendance } from './OwedAttendance';
import { OwedPoll } from './OwedPoll';
import { OwedSignUp } from './OwedSignUp';

interface OwedItemProps {
  item: OwedItemFacts;
  board: StartBoard;
}

export const OwedItem: FC<OwedItemProps> = ({ item, board }) => {
  if (item.kind === 'poll') {
    return <OwedPoll entry={item.entry} poll={item.poll} board={board} />;
  }
  if (item.kind === 'signUpList') {
    return <OwedSignUp entry={item.entry} list={item.list} board={board} />;
  }

  return <OwedAttendance entry={item.entry} board={board} />;
};
