import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useActTrainings } from '../hooks/use-act-trainings';
import { TRAININGS_EMPTY, TRAININGS_TITLE } from '../training-copy';

interface ActTrainingsSectionProps {
  studio: Studio;
  cast: readonly CastPerson[];
}

export const ActTrainingsSection: FC<ActTrainingsSectionProps> = ({ studio, cast }) => {
  const trainings = useActTrainings(studio, cast);
  const rows = trainings.rows.map((row) => (
    <KkHubRow
      key={row.calendarEntryId}
      label={row.label}
      icon="calendar"
      meta={row.meta}
      hint={row.hint}
      hintTone="gold"
      component={Link}
      to={row.to}
      search={row.search}
    />
  ));
  const list = rows.length === 0 ? <KkNote>{TRAININGS_EMPTY}</KkNote> : <KkPanel>{rows}</KkPanel>;

  return (
    <KkPanelSection title={TRAININGS_TITLE} action={trainings.start}>
      {list}
    </KkPanelSection>
  );
};
