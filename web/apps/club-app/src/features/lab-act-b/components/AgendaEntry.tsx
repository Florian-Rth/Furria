import type { FC } from 'react';
import { actPagePathOf } from '@/features/acts/acts-origin';
import type { AgendaItem } from '../act-agenda';
import { trainingPathOf } from '../agenda-paths';
import { AgendaEveningRow } from './AgendaEveningRow';
import { AgendaTrainingRow } from './AgendaTrainingRow';

export interface AgendaEntryRole {
  actId: number;
  answers: boolean;
  showsTally: boolean;
  marksAttendance: boolean;
}

interface AgendaEntryProps {
  item: AgendaItem;
  order: number;
  current: boolean;
  showsDate?: boolean;
  role: AgendaEntryRole;
}

export const AgendaEntry: FC<AgendaEntryProps> = ({
  item,
  order,
  current,
  showsDate = true,
  role,
}) => {
  if (item.kind === 'evening') {
    return (
      <AgendaEveningRow evening={item} order={order} current={current} showsDate={showsDate} />
    );
  }

  const rollSearch = { view: 'details', roll: item.calendarEntryId };
  const to = role.marksAttendance
    ? actPagePathOf(role.actId)
    : trainingPathOf(item.calendarEntryId);
  const search = role.marksAttendance ? rollSearch : undefined;

  return (
    <AgendaTrainingRow
      training={item}
      order={order}
      current={current}
      showsDate={showsDate}
      answers={role.answers}
      showsTally={role.showsTally}
      to={to}
      search={search}
    />
  );
};
