import { JobReasonLine } from '@furria/studio/JobReasonLine';
import type { JobChoice } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobChoicesSectionProps {
  title: string;
  aside: string | null;
  choices: readonly JobChoice[];
}

export const JobChoicesSection: FC<JobChoicesSectionProps> = ({ title, aside, choices }) => {
  const buttons = choices.map((choice) => (
    <KkPillButton
      key={choice.key}
      text={choice.text}
      label={choice.label}
      pressed={choice.current}
      disabled={choice.disabled}
      onPress={choice.press}
    />
  ));

  return (
    <KkJobPanel.Group label={title}>
      <KkJobPanel.GroupHead text={title} aside={aside} />
      <KkJobPanel.Tools>{buttons}</KkJobPanel.Tools>
      <JobReasonLine actions={choices} />
    </KkJobPanel.Group>
  );
};
