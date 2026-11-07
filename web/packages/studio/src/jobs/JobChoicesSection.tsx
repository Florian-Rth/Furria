import type { JobChoice } from '@furria/studio/edit-jobs-view';
import { JobReasonLine } from '@furria/studio/JobReasonLine';
import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';

interface JobChoicesSectionProps {
  title: string;
  aside: string | null;
  choices: readonly JobChoice[];
}

export const JobChoicesSection: FC<JobChoicesSectionProps> = ({ title, aside, choices }) => {
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
      <JobReasonLine actions={choices} />
    </KkEjPanel.Group>
  );
};
