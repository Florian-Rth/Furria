import { KkCountHead } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GreetingBadgeView, GreetingFactView } from '../greeting/head-view';

const PROFILE_ROUTE = '/profile';
const YEARS_WORD = 'JAHRE';

interface StartHeadFactsProps {
  line: string | null;
  badge: GreetingBadgeView | null;
  facts: readonly GreetingFactView[];
}

export const StartHeadFacts: FC<StartHeadFactsProps> = ({ line, badge, facts }) => {
  const note = line === null ? null : <KkCountHead.Note>{line}</KkCountHead.Note>;
  const badgeMark =
    badge === null ? null : (
      <KkCountHead.Badge
        value={badge.years}
        word={YEARS_WORD}
        label={badge.label}
        festive={badge.festive}
        component={Link}
        to={PROFILE_ROUTE}
      />
    );
  const factMarks = facts.map((fact) => (
    <KkCountHead.Fact key={fact.key} icon={fact.icon} glyph={fact.glyph} text={fact.text} />
  ));

  return (
    <KkCountHead.Facts>
      {note}
      {badgeMark}
      {factMarks}
    </KkCountHead.Facts>
  );
};
