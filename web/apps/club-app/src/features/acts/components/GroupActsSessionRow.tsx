import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { historyActMarkOf } from '../act-history';
import { KIND_ICONS, toHistoryActHint, toHistoryActMeta } from '../acts-copy';
import { actPageLinkOf } from '../acts-origin';
import type { GroupAct } from '../schemas';

interface GroupActsSessionRowProps {
  groupId: number;
  act: GroupAct;
}

export const GroupActsSessionRow: FC<GroupActsSessionRowProps> = ({ groupId, act }) => {
  const link = actPageLinkOf(act.actId, { from: 'groupActs', group: groupId });
  const hint = toHistoryActHint(historyActMarkOf(act));
  const icon = KIND_ICONS[act.kind ?? 'point'];
  const meta = toHistoryActMeta(act);

  return (
    <KkHubRow
      label={act.name}
      icon={icon}
      meta={meta}
      hint={hint?.label}
      hintTone={hint?.tone}
      component={Link}
      to={link.to}
      search={link.search}
    />
  );
};
