import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import {
  LAB_GREETINGS,
  LAB_LEAD,
  LAB_TITLE,
  labBanksOf,
  labGreetingPathOf,
  labHeadlineOf,
} from '../lab-greetings';
import { LabEditorSection } from './LabEditorSection';

const header = <KkTitleHeader title={LAB_TITLE} lead={LAB_LEAD} />;

export const LabHubPage: FC = () => {
  const sections = labBanksOf(LAB_GREETINGS).map((bank) => {
    const rows = bank.greetings.map((greeting) => (
      <KkHubRow
        key={greeting.slug}
        label={greeting.title}
        icon={bank.icon}
        meta={labHeadlineOf(greeting)}
        component={Link}
        to={labGreetingPathOf(greeting)}
      />
    ));

    return (
      <KkPanelSection key={bank.bank} title={bank.title}>
        <KkPanel>{rows}</KkPanel>
      </KkPanelSection>
    );
  });

  return (
    <KkScreen
      kind="detail"
      title={LAB_TITLE}
      origin={MANAGE_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.manage}
    >
      <KkPanelStack>
        <LabEditorSection />
        {sections}
      </KkPanelStack>
    </KkScreen>
  );
};
