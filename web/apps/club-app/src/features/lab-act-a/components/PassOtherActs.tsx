import { KkDensePanel } from '@furria/ui/KkDensePanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useId } from 'react';
import type { GroupAct } from '@/features/acts/schemas';
import { GROUP_OTHER_ACTS_TITLE, toOtherActMeta } from '../pass-copy';
import { passActLinkOf } from '../pass-paths';

interface PassOtherActsProps {
  acts: readonly GroupAct[];
}

export const PassOtherActs: FC<PassOtherActsProps> = ({ acts }) => {
  const headingId = useId();

  if (acts.length === 0) {
    return null;
  }

  const lines = acts.map((act) => {
    const link = passActLinkOf(act.actId);

    return (
      <KkDensePanel.Line
        key={act.actId}
        anchor={<KkDensePanel.Icon name="stage" />}
        title={act.name}
        meta={toOtherActMeta(act.kind)}
        accessibleLabel={act.name}
        component={Link}
        to={link.to}
        params={link.params}
      />
    );
  });

  return (
    <KkDensePanel material="club" labelledBy={headingId}>
      <KkDensePanel.Head id={headingId} label={GROUP_OTHER_ACTS_TITLE} />
      <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
    </KkDensePanel>
  );
};
