import { KkLead } from '@furria/ui/KkLead';
import { KkSection } from '@furria/ui/KkSection';
import { kkTokens } from '@furria/ui/tokens';
import type { FC } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';
import { groupMatcher } from '@/features/group-matcher/api';
import {
  matcherIntro,
  matcherKicker,
  matcherSectionId,
  matcherTitle,
} from '@/features/group-matcher/matcher-content';
import { MatcherPanel } from './internal/layout/MatcherPanel';
import { MatcherBody } from './internal/ui/MatcherBody';

export const GroupMatcherSection: FC = () => {
  const source = groupMatcher.useSource();

  return (
    <KkSection
      id={matcherSectionId}
      sx={(theme) => ({
        scrollMarginTop: `calc(var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px) + ${theme.spacing(kkTokens.layout.mastheadClearance)})`,
      })}
    >
      <KkSection.Header kicker={matcherKicker} title={matcherTitle} />
      <KkLead>{matcherIntro}</KkLead>
      <MatcherPanel>
        <MatcherBody source={source} />
      </MatcherPanel>
    </KkSection>
  );
};
