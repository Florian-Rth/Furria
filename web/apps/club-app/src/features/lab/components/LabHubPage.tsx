import {
  KkHubRow,
  KkPanel,
  KkPanelSection,
  KkPanelStack,
  KkScreen,
  KkTitleHeader,
} from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MANAGE_ORIGIN } from '@/features/session';
import {
  LAB_GREETINGS,
  LAB_LEAD,
  LAB_TITLE,
  labBanksOf,
  labGreetingPathOf,
  labHeadlineOf,
} from '../lab-greetings';

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
    <KkScreen kind="detail" title={LAB_TITLE} origin={MANAGE_ORIGIN} header={header}>
      <KkPanelStack>{sections}</KkPanelStack>
    </KkScreen>
  );
};
