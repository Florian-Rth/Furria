import { KkAgenda } from '@furria/ui/KkAgenda';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { KIND_ICONS } from '@/features/acts/acts-copy';
import { groupActHintOf, groupActMetaOf } from '../agenda-copy';
import { actAgendaPathOf } from '../agenda-paths';
import type { GroupAgendaAct as GroupAgendaActEntry } from '../group-agenda';
import { AgendaEntry } from './AgendaEntry';

const ORDER_STEP = 2;

interface GroupAgendaActProps {
  entry: GroupAgendaActEntry;
  index: number;
  soonest: boolean;
}

export const GroupAgendaAct: FC<GroupAgendaActProps> = ({ entry, index, soonest }) => {
  const { act, next } = entry;
  const order = index * ORDER_STEP;
  const role = {
    actId: act.actId,
    answers: entry.answers,
    showsTally: entry.mine?.viewerLeads === true,
    marksAttendance: entry.mine?.viewerLeads === true,
  };
  const row =
    next === null ? null : (
      <AgendaEntry item={next} order={order + 1} current={soonest} role={role} />
    );
  const meta = groupActMetaOf(entry);
  const hint = groupActHintOf(entry);
  const to = actAgendaPathOf(act.actId);
  const icon = KIND_ICONS[act.kind ?? 'point'];

  return (
    <KkAgenda.Act
      name={act.name}
      meta={meta}
      hint={hint}
      icon={icon}
      dimmed={entry.dimmed}
      order={order}
      component={Link}
      to={to}
    >
      {row}
    </KkAgenda.Act>
  );
};
