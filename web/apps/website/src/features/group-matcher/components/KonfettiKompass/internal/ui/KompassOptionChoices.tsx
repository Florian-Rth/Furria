import type { FC } from 'react';
import type { FilterOption } from '@/lib/seed/group-matcher';
import { KompassChoiceButton } from './KompassChoiceButton';

interface KompassOptionChoicesProps {
  options: FilterOption[];
  onAnswer: (answer: string) => void;
}

export const KompassOptionChoices: FC<KompassOptionChoicesProps> = ({ options, onAnswer }) => (
  <>
    {options.map((option) => (
      <KompassChoiceButton
        key={option.id}
        label={option.label}
        onSelect={() => onAnswer(option.id)}
      />
    ))}
  </>
);
