import Button from '@mui/material/Button';
import type { FC } from 'react';
import { matcherLabels } from '@/features/group-matcher/matcher-content';
import type { MatcherQuestion } from '@/lib/seed/group-matcher';
import { MatcherChoiceRow } from '../layout/MatcherChoiceRow';
import { MatcherFooterGroup } from '../layout/MatcherFooterGroup';
import { MatcherStepBody } from '../layout/MatcherStepBody';
import { MatcherStepFooter } from '../layout/MatcherStepFooter';
import { MatcherOptionChoices } from './MatcherOptionChoices';
import { MatcherPrompt } from './MatcherPrompt';
import { MatcherStanceChoices } from './MatcherStanceChoices';
import { MatcherStepReveal } from './MatcherStepReveal';

interface MatcherQuestionStepProps {
  question: MatcherQuestion;
  backDisabled: boolean;
  finishDisabled: boolean;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  onBack: () => void;
  onFinish: () => void;
}

export const MatcherQuestionStep: FC<MatcherQuestionStepProps> = ({
  question,
  backDisabled,
  finishDisabled,
  onAnswer,
  onSkip,
  onBack,
  onFinish,
}) => {
  const choices =
    question.role === 'weighted' ? (
      <MatcherStanceChoices onAnswer={onAnswer} />
    ) : (
      <MatcherOptionChoices options={question.options} onAnswer={onAnswer} />
    );

  return (
    <>
      <MatcherStepBody>
        <MatcherStepReveal key={question.id}>
          <MatcherPrompt prompt={question.prompt} />
        </MatcherStepReveal>
        <MatcherChoiceRow>{choices}</MatcherChoiceRow>
      </MatcherStepBody>
      <MatcherStepFooter sx={{ mt: 'auto' }}>
        <Button
          variant="text"
          onClick={onBack}
          disabled={backDisabled}
          sx={{ color: 'text.secondary' }}
        >
          {matcherLabels.back}
        </Button>
        <MatcherFooterGroup>
          <Button variant="text" onClick={onSkip} sx={{ color: 'text.secondary' }}>
            {matcherLabels.skip}
          </Button>
          <Button variant="outlined" onClick={onFinish} disabled={finishDisabled}>
            {matcherLabels.finish}
          </Button>
        </MatcherFooterGroup>
      </MatcherStepFooter>
    </>
  );
};
