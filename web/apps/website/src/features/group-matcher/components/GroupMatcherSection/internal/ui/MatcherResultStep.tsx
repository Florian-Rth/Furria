import Button from '@mui/material/Button';
import type { FC } from 'react';
import { matcherLabels, matcherResultLabels } from '@/features/group-matcher/matcher-content';
import { MatcherStepBody } from '../layout/MatcherStepBody';
import { MatcherStepFooter } from '../layout/MatcherStepFooter';
import type { MatcherResultView } from '../logic/matcher-result';
import { MatcherResultBody } from './MatcherResultBody';
import { MatcherStepReveal } from './MatcherStepReveal';

interface MatcherResultStepProps {
  view: MatcherResultView;
  summary: string;
  onChangeAnswers: () => void;
  onRestart: () => void;
}

export const MatcherResultStep: FC<MatcherResultStepProps> = ({
  view,
  summary,
  onChangeAnswers,
  onRestart,
}) => (
  <>
    <MatcherStepReveal>
      <MatcherStepBody>
        <MatcherResultBody view={view} summary={summary} />
      </MatcherStepBody>
    </MatcherStepReveal>
    <MatcherStepFooter sx={{ mt: 'auto', pt: { xs: 2, md: 3 } }}>
      <Button variant="text" onClick={onChangeAnswers} sx={{ color: 'text.secondary' }}>
        {matcherResultLabels.changeAnswers}
      </Button>
      <Button variant="outlined" onClick={onRestart}>
        {matcherLabels.restart}
      </Button>
    </MatcherStepFooter>
  </>
);
