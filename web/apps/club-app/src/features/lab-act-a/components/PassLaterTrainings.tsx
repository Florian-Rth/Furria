import { KkDensePanel } from '@furria/ui/KkDensePanel';
import type { FC } from 'react';
import { useId } from 'react';
import type { PassTrainingLine as PassTrainingLineModel } from '../pass-act';
import { LATER_TRAININGS_TITLE } from '../pass-copy';
import { PassTrainingLine } from './PassTrainingLine';

interface PassLaterTrainingsProps {
  trainings: readonly PassTrainingLineModel[];
  answers: boolean;
}

export const PassLaterTrainings: FC<PassLaterTrainingsProps> = ({ trainings, answers }) => {
  const headingId = useId();

  if (trainings.length === 0) {
    return null;
  }

  const lines = trainings.map((training) => (
    <PassTrainingLine key={training.calendarEntryId} training={training} answers={answers} />
  ));

  return (
    <KkDensePanel material="own" labelledBy={headingId}>
      <KkDensePanel.Head id={headingId} label={LATER_TRAININGS_TITLE} />
      <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
    </KkDensePanel>
  );
};
