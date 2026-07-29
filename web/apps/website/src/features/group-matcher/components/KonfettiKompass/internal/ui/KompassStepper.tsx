import type { FC } from 'react';
import { buildAnsweredSummary, buildProgressLabel } from '@/features/group-matcher/kompass-content';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { countAnsweredQuestions, resolveProgressPercent } from '../logic/kompass-progress';
import { useKompassProgress } from '../logic/use-kompass-progress';
import { KompassDoneStep } from './KompassDoneStep';
import { KompassProgress } from './KompassProgress';
import { KompassQuestionStep } from './KompassQuestionStep';

interface KompassStepperProps {
  matcher: GroupMatcher;
}

export const KompassStepper: FC<KompassStepperProps> = ({ matcher }) => {
  const questionIds = matcher.questions.map((question) => question.id);
  const { progress, answerQuestion, skipQuestion, goToPreviousQuestion, restart } =
    useKompassProgress(questionIds);

  const question = matcher.questions[progress.index];
  const progressLabel = buildProgressLabel(progress.index, questionIds.length);
  const percent = resolveProgressPercent(progress, questionIds);

  if (question === undefined) {
    const summary = buildAnsweredSummary(
      countAnsweredQuestions(progress.answers),
      questionIds.length,
    );

    return (
      <>
        <KompassProgress label={progressLabel} percent={percent} />
        <KompassDoneStep summary={summary} onBack={goToPreviousQuestion} onRestart={restart} />
      </>
    );
  }

  const atFirstQuestion = progress.index === 0;

  return (
    <>
      <KompassProgress label={progressLabel} percent={percent} />
      <KompassQuestionStep
        question={question}
        backDisabled={atFirstQuestion}
        onAnswer={answerQuestion}
        onSkip={skipQuestion}
        onBack={goToPreviousQuestion}
      />
    </>
  );
};
