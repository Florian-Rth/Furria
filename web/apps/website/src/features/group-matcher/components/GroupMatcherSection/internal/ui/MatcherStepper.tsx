import type { FC } from 'react';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { useMatcherProgress } from '../logic/use-matcher-progress';
import { MatcherProgress } from './MatcherProgress';
import { MatcherQuestionStep } from './MatcherQuestionStep';
import { MatcherResultStep } from './MatcherResultStep';

interface MatcherStepperProps {
  matcher: GroupMatcher;
}

export const MatcherStepper: FC<MatcherStepperProps> = ({ matcher }) => {
  const {
    step,
    progressLabel,
    percent,
    answerQuestion,
    skipQuestion,
    goToPreviousQuestion,
    finishQuestions,
    restart,
  } = useMatcherProgress(matcher);

  if (step.kind === 'result') {
    return (
      <MatcherResultStep
        view={step.view}
        summary={step.summary}
        onChangeAnswers={goToPreviousQuestion}
        onRestart={restart}
      />
    );
  }

  return (
    <>
      <MatcherProgress label={progressLabel} percent={percent} />
      <MatcherQuestionStep
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
