import { KkNote } from '@furria/ui/KkNote';
import { KkPassRail } from '@furria/ui/KkPassRail';
import { KkPassSection } from '@furria/ui/KkPassSection';
import type { FC } from 'react';
import type { PassGroupPage } from '../hooks/use-pass-group-page';
import { GROUP_ACTS_EMPTY, GROUP_ACTS_TITLE, toCastCount } from '../pass-copy';
import { PassActCard } from './PassActCard';
import { PassOtherActs } from './PassOtherActs';

interface PassGroupActsProps {
  page: PassGroupPage;
}

export const PassGroupActs: FC<PassGroupActsProps> = ({ page }) => {
  const count = page.cards.length + page.rows.length;
  const cards = page.cards.map((act) => (
    <PassActCard
      key={act.actId}
      act={act}
      viewerId={page.viewerId}
      level={3}
      linked
      showsGroup={false}
      component="li"
    />
  ));
  const rail =
    cards.length === 0 ? null : (
      <KkPassRail label={GROUP_ACTS_TITLE} single={cards.length === 1}>
        {cards}
      </KkPassRail>
    );
  const empty = page.actsReady && count === 0 ? <KkNote>{GROUP_ACTS_EMPTY}</KkNote> : null;

  return (
    <KkPassSection title={GROUP_ACTS_TITLE} count={toCastCount(count)}>
      {rail}
      {empty}
      <PassOtherActs acts={page.rows} />
    </KkPassSection>
  );
};
