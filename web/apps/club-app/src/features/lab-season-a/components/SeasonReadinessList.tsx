import { KkReadout } from '@furria/ui/KkReadout';
import type { FC } from 'react';
import type { SeasonDetails } from '../hooks/use-season-details';
import { READINESS_TITLE } from '../season-a-copy';

interface SeasonReadinessListProps {
  details: SeasonDetails;
}

export const SeasonReadinessList: FC<SeasonReadinessListProps> = ({ details }) => {
  const lines = details.readiness.map((line) => (
    <KkReadout.Line
      key={line.check}
      title={line.title}
      trailing={line.trailing}
      level={line.level}
    />
  ));

  return (
    <KkReadout title={READINESS_TITLE} aside={details.readinessText}>
      <KkReadout.Lines>{lines}</KkReadout.Lines>
    </KkReadout>
  );
};
