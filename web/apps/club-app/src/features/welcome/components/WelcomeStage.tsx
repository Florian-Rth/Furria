import { KkWelcomeStage } from '@furria/ui/KkWelcomeStage';
import type { FC } from 'react';
import {
  joinedLineOf,
  WELCOME_CALL_ANSWER,
  WELCOME_CALL_LEAD,
  WELCOME_DATELINE,
  WELCOME_ENTER_LABEL,
  WELCOME_FOUNDED_LINE,
  WELCOME_SKIP_LABEL,
  welcomeBillOf,
  welcomeLabelOf,
} from '../welcome-copy';
import type { WelcomePlan } from '../welcome-plan';

interface WelcomeStageProps {
  plan: WelcomePlan;
  leaving: boolean;
  onLeave: () => void;
}

export const WelcomeStage: FC<WelcomeStageProps> = ({ plan, leaving, onLeave }) => {
  const { beats } = plan;
  const label = welcomeLabelOf(plan.firstName);
  const joinedLine = joinedLineOf(plan.joining);
  const billed = welcomeBillOf(plan).map((line) => (
    <KkWelcomeStage.Line key={line.key} at={line.at} tone={line.tone}>
      {line.text}
    </KkWelcomeStage.Line>
  ));

  return (
    <KkWelcomeStage label={label} leaving={leaving} joltAt={beats.answer} onSkip={onLeave}>
      <KkWelcomeStage.Top>
        <KkWelcomeStage.Dateline at={beats.dateline}>{WELCOME_DATELINE}</KkWelcomeStage.Dateline>
      </KkWelcomeStage.Top>
      <KkWelcomeStage.Bill>
        <KkWelcomeStage.Year years={plan.reelYears} at={beats.reel} rollMs={beats.reelMs} />
        <KkWelcomeStage.Line at={beats.founded} tone="quiet">
          {WELCOME_FOUNDED_LINE}
        </KkWelcomeStage.Line>
        <KkWelcomeStage.Line at={beats.joined} tone="plain">
          {joinedLine}
        </KkWelcomeStage.Line>
        <KkWelcomeStage.Name name={plan.firstName} at={beats.name} staggerMs={beats.letterMs} />
        {billed}
      </KkWelcomeStage.Bill>
      <KkWelcomeStage.Foot>
        <KkWelcomeStage.Call
          lead={WELCOME_CALL_LEAD}
          answer={WELCOME_CALL_ANSWER}
          at={beats.call}
          answerAt={beats.answer}
        />
        <KkWelcomeStage.Action
          skipLabel={WELCOME_SKIP_LABEL}
          goLabel={WELCOME_ENTER_LABEL}
          goAt={beats.enter}
          onPress={onLeave}
        />
      </KkWelcomeStage.Foot>
      <KkWelcomeStage.Sweep at={beats.sweep} />
    </KkWelcomeStage>
  );
};
