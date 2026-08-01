import { KkSection } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';
import {
  matcherIntro,
  matcherKicker,
  matcherSectionId,
  matcherTitle,
} from '@/features/group-matcher/matcher-content';
import { MatcherPanel } from './internal/layout/MatcherPanel';
import { useMatcherSource } from './internal/logic/use-matcher-source';
import { MatcherBody } from './internal/ui/MatcherBody';

export const GroupMatcherSection: FC = () => {
  const source = useMatcherSource();

  return (
    <KkSection
      id={matcherSectionId}
      sx={{ scrollMarginTop: `calc(var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px) + 1rem)` }}
    >
      <KkSection.Header kicker={matcherKicker} title={matcherTitle} />
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '48rem' }}
      >
        {matcherIntro}
      </Typography>
      <MatcherPanel>
        <MatcherBody source={source} />
      </MatcherPanel>
    </KkSection>
  );
};
