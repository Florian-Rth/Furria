import type { FC } from 'react';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { useKompassProgress } from '../logic/use-kompass-progress';
import { KompassProgress } from './KompassProgress';
import { KompassQuestionStep } from './KompassQuestionStep';
import { KompassResultStep } from './KompassResultStep';

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
    finishQuestions,
    restart,
  } = useKompassProgress(matcher);

  if (step.kind === 'result') {
    return (
      <KompassResultStep
        view={step.view}
        summary={step.summary}
        onChangeAnswers={goToPreviousQuestion}
        onRestart={restart}
      />
    );
  }

  return (
    <>
      <KompassProgress label={progressLabel} percent={percent} />
      <KompassQuestionStep
        question={step.question}
        backDisabled={step.backDisabled}
        finishDisabled={step.finishDisabled}
        onAnswer={answerQuestion}
        onSkip={skipQuestion}
        onBack={goToPreviousQuestion}
        onFinish={finishQuestions}
      />
    </>
  );
};
