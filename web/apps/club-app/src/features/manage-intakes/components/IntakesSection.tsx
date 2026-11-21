import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import type { FC } from 'react';
import { SECTION_TITLES } from '../intake-labels';
import type { IntakeSection } from '../intake-rules';
import { IntakeRow } from './IntakeRow';

interface IntakesSectionProps {
  section: IntakeSection;
  now: Date;
  action: KkPanelAction | undefined;
}

export const IntakesSection: FC<IntakesSectionProps> = ({ section, now, action }) => {
  const rows = section.intakes.map((intake) => (
    <IntakeRow key={intake.intakeId} intake={intake} now={now} />
  ));

  return (
    <KkPanelSection title={SECTION_TITLES[section.id]} action={action}>
      <KkPanel variant="list">{rows}</KkPanel>
    </KkPanelSection>
  );
};
