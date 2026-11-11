import type { FC } from 'react';
import type { FilterOption } from '@/features/group-matcher/types';
import { MatcherChoiceButton } from './MatcherChoiceButton';

interface MatcherOptionChoicesProps {
  options: FilterOption[];
  onAnswer: (answer: string) => void;
}

export const MatcherOptionChoices: FC<MatcherOptionChoicesProps> = ({ options, onAnswer }) => (
  <>
    {options.map((option) => (
      <MatcherChoiceButton
        key={option.id}
        label={option.label}
        onSelect={() => onAnswer(option.id)}
      />
    ))}
  </>
);
