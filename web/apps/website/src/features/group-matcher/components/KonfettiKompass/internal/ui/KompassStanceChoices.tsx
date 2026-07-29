import type { FC } from 'react';
import { kompassStanceChoices } from '@/features/group-matcher/kompass-content';
import { KompassChoiceButton } from './KompassChoiceButton';

interface KompassStanceChoicesProps {
  onAnswer: (answer: string) => void;
}

export const KompassStanceChoices: FC<KompassStanceChoicesProps> = ({ onAnswer }) => (
  <>
    {kompassStanceChoices.map((choice) => (
      <KompassChoiceButton
        key={choice.value}
        label={choice.label}
        onSelect={() => onAnswer(choice.value)}
      />
    ))}
  </>
);
