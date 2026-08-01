import type { FC } from 'react';
import { matcherStanceChoices } from '@/features/group-matcher/matcher-content';
import { MatcherChoiceButton } from './MatcherChoiceButton';

interface MatcherStanceChoicesProps {
  onAnswer: (answer: string) => void;
}

export const MatcherStanceChoices: FC<MatcherStanceChoicesProps> = ({ onAnswer }) => (
  <>
    {matcherStanceChoices.map((choice) => (
      <MatcherChoiceButton
        key={choice.value}
        label={choice.label}
        onSelect={() => onAnswer(choice.value)}
      />
    ))}
  </>
);
