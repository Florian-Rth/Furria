import type { FC } from 'react';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { useKompassProgress } from '../logic/use-kompass-progress';
import { KompassDoneStep } from './KompassDoneStep';
import { KompassProgress } from './KompassProgress';
import { KompassQuestionStep } from './KompassQuestionStep';

interface KompassStepperProps {
  matcher: GroupMatcher;
}

export const KompassStepper: FC<KompassStepperProps> = ({ matcher }) => {
  const {
    step,
    progressLabel,
    percent,
    answerQuestion,
    skipQuestion,
    goToPreviousQuestion,
    restart,
  } = useKompassProgress(matcher);

  const currentStep =
    step.kind === 'done' ? (
      <KompassDoneStep summary={step.summary} onBack={goToPreviousQuestion} onRestart={restart} />
    ) : (
      <KompassQuestionStep
        question={step.question}
        backDisabled={step.backDisabled}
        onAnswer={answerQuestion}
        onSkip={skipQuestion}
        onBack={goToPreviousQuestion}
      />
    );

  return (
    <>
      <KompassProgress label={progressLabel} percent={percent} />
      {currentStep}
    </>
  );
};
