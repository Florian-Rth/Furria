import { KkReadout } from '@furria/ui/KkReadout';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import { SECTION_TITLES } from '../system-copy';
import { SYSTEM_HELP_SPOTS } from '../system-help-copy';
import type { SystemMoment } from '../system-view';
import { programFactsOf } from '../system-view';

interface SystemProgramSectionProps {
  status: SystemStatus;
  moment: SystemMoment;
}

export const SystemProgramSection: FC<SystemProgramSectionProps> = ({ status, moment }) => {
  const facts = programFactsOf(status, moment).map((fact) => (
    <KkReadout.Fact key={fact.key} label={fact.label} value={fact.value} />
  ));

  return (
    <KkReadout title={SECTION_TITLES.program} landing={SYSTEM_HELP_SPOTS.program}>
      <KkReadout.Facts>{facts}</KkReadout.Facts>
    </KkReadout>
  );
};
