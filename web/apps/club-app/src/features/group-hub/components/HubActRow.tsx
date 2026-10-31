import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { KIND_ICONS } from '@/features/acts/acts-copy';
import { actPageLinkOf } from '@/features/acts/acts-origin';
import type { GroupAct } from '@/features/acts/schemas';
import { toActKindLabel } from '@/features/running-order/running-order-copy';

const IN_CAST_HINT = 'dabei';

interface HubActRowProps {
  groupId: number;
  act: GroupAct;
}

export const HubActRow: FC<HubActRowProps> = ({ groupId, act }) => {
  const link = actPageLinkOf(act.actId, { from: 'group', group: groupId });
  const meta = act.kind === null ? undefined : toActKindLabel(act.kind);
  const hint = act.viewerInCast ? IN_CAST_HINT : undefined;

  return (
    <KkHubRow
      label={act.name}
      icon={KIND_ICONS[act.kind ?? 'point']}
      meta={meta}
      hint={hint}
      hintTone="accent"
      component={Link}
      to={link.to}
      search={link.search}
    />
  );
};
