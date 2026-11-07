import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import type { EjChoice } from '../edit-jobs-view';
import { EjReasonLine } from './EjReasonLine';

interface EjChoicesSectionProps {
  title: string;
  aside: string | null;
  choices: readonly EjChoice[];
}

export const EjChoicesSection: FC<EjChoicesSectionProps> = ({ title, aside, choices }) => {
  const buttons = choices.map((choice) => (
    <KkEjButton
      key={choice.key}
      text={choice.text}
      label={choice.label}
      pressed={choice.current}
      disabled={choice.disabled}
      onPress={choice.press}
    />
  ));

  return (
    <KkEjPanel.Group label={title}>
      <KkEjPanel.GroupHead text={title} aside={aside} />
      <KkEjPanel.Tools>{buttons}</KkEjPanel.Tools>
      <EjReasonLine actions={choices} />
    </KkEjPanel.Group>
  );
};
