import Button from '@mui/material/Button';
import type { FC } from 'react';
import { kompassLabels } from '@/features/group-matcher/kompass-content';
import type { MatcherQuestion } from '@/lib/seed/group-matcher';
import { KompassChoiceRow } from '../layout/KompassChoiceRow';
import { KompassStepBody } from '../layout/KompassStepBody';
import { KompassStepFooter } from '../layout/KompassStepFooter';
import { KompassOptionChoices } from './KompassOptionChoices';
import { KompassPrompt } from './KompassPrompt';
import { KompassStanceChoices } from './KompassStanceChoices';
import { KompassStepReveal } from './KompassStepReveal';

interface KompassQuestionStepProps {
  question: MatcherQuestion;
  backDisabled: boolean;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export const KompassQuestionStep: FC<KompassQuestionStepProps> = ({
  question,
  backDisabled,
  onAnswer,
  onSkip,
  onBack,
}) => {
  const choices =
    question.role === 'weighted' ? (
      <KompassStanceChoices onAnswer={onAnswer} />
    ) : (
      <KompassOptionChoices options={question.options} onAnswer={onAnswer} />
    );

  return (
    <>
      <KompassStepBody>
        <KompassStepReveal key={question.id}>
          <KompassPrompt prompt={question.prompt} />
        </KompassStepReveal>
        <KompassChoiceRow>{choices}</KompassChoiceRow>
      </KompassStepBody>
      <KompassStepFooter sx={{ mt: 'auto' }}>
        <Button
          variant="text"
          onClick={onBack}
          disabled={backDisabled}
          sx={{ color: 'text.secondary' }}
        >
          {kompassLabels.back}
        </Button>
        <Button variant="text" onClick={onSkip} sx={{ color: 'text.secondary' }}>
          {kompassLabels.skip}
        </Button>
      </KompassStepFooter>
    </>
  );
};
