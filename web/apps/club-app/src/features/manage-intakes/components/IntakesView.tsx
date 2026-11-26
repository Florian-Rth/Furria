import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  EMPTY_INTAKES,
  INTAKE_NEW_ROUTE,
  INTAKES_TITLE,
  NEW_INTAKE_ACTION_LABEL,
  NEW_INTAKE_LABEL,
} from '../intake-labels';
import { toIntakeSections } from '../intake-rules';
import { INTAKES_HELP_SPOTS } from '../intakes-help-copy';
import type { IntakeSummary } from '../schemas';
import { IntakesSection } from './IntakesSection';

const VIEW_GAP = 3;

const NEW_ACTION: KkPanelAction = {
  label: NEW_INTAKE_LABEL,
  icon: 'add',
  ariaLabel: NEW_INTAKE_ACTION_LABEL,
  component: Link,
  to: INTAKE_NEW_ROUTE,
};

interface IntakesViewProps {
  intakes: readonly IntakeSummary[];
}

export const IntakesView: FC<IntakesViewProps> = ({ intakes }) => {
  const now = new Date();
  const sections = toIntakeSections(intakes);

  if (sections.length === 0) {
    return (
      <KkPanelSection title={INTAKES_TITLE} action={NEW_ACTION} landing={INTAKES_HELP_SPOTS.list}>
        <KkPanel variant="block">
          <KkEmptyState
            size="panel"
            icon="qr"
            title={EMPTY_INTAKES.title}
            description={EMPTY_INTAKES.description}
          />
        </KkPanel>
      </KkPanelSection>
    );
  }

  const actionOf = (index: number): KkPanelAction | undefined =>
    index === 0 ? NEW_ACTION : undefined;
  const landingOf = (index: number): string | undefined =>
    index === 0 ? INTAKES_HELP_SPOTS.list : undefined;
  const panels = sections.map((section, index) => (
    <IntakesSection
      key={section.id}
      section={section}
      now={now}
      action={actionOf(index)}
      landing={landingOf(index)}
    />
  ));

  return <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>{panels}</Stack>;
};
