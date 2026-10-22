import type { KkClubIcon } from '@furria/ui/club-icon';
import type { KkIconName } from '@furria/ui/KkIcon';
import { formatFullDay } from '../start-lines';
import type { GreetingAct } from './greeting-act';
import type { GreetingBadge, GreetingFact, GreetingFactsSource } from './greeting-facts';
import { toGreetingFacts } from './greeting-facts';
import type { GreetingHolder, GreetingView } from './greeting-view';
import { toGreetingView } from './greeting-view';
import type { HeadSplit } from './head-split';
import { birthdayYearsOf, headSplitOf } from './head-split';

export interface GreetingFactView {
  key: string;
  text: string;
  icon: KkIconName | undefined;
  glyph: KkClubIcon | undefined;
}

export interface GreetingBadgeView extends GreetingBadge {
  label: string;
}

export interface StartHeadView {
  greeting: GreetingView;
  split: HeadSplit;
  countFrom: number | undefined;
  badge: GreetingBadgeView | null;
  facts: GreetingFactView[];
  line: string | null;
  lapClosing: GreetingHolder | null;
}

export interface StartHeadRequest {
  act: GreetingAct;
  firstName: string;
  birthDate: string | null;
  now: Date;
  reducedMotion: boolean;
  follows: boolean;
  holder: GreetingHolder;
  facts: GreetingFactsSource;
}

const factViewOf = (fact: GreetingFact): GreetingFactView =>
  fact.kind === 'since'
    ? { key: 'since', text: `seit ${fact.year}`, icon: 'person', glyph: undefined }
    : {
        key: fact.name,
        text: fact.name,
        icon: fact.glyph === null ? 'role' : undefined,
        glyph: fact.glyph ?? undefined,
      };

const badgeViewOf = (badge: GreetingBadge): GreetingBadgeView => ({
  ...badge,
  label: `${badge.years} Jahre seit deinem Beitritt am ${formatFullDay(badge.joinedOn)}`,
});

export const toStartHeadView = ({
  act,
  firstName,
  birthDate,
  now,
  reducedMotion,
  follows,
  holder,
  facts,
}: StartHeadRequest): StartHeadView => {
  const greeting = toGreetingView({ act, firstName, reducedMotion, follows, holder });
  const split = headSplitOf({
    moment: act.moment,
    parts: greeting.parts,
    birthdayYears: birthdayYearsOf(birthDate, now),
  });
  const shown = toGreetingFacts(facts);

  return {
    greeting,
    split,
    countFrom: split.kind === 'number' ? undefined : greeting.countFrom,
    badge: shown.badge === null ? null : badgeViewOf(shown.badge),
    facts: shown.facts.map(factViewOf),
    line: greeting.line,
    lapClosing: greeting.lapClosing,
  };
};
