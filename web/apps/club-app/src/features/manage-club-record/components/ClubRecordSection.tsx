import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import type { ClubRecordSection as Section } from '../club-record-labels';
import { CLUB_RECORD_SECTION_TITLES, toSectionLandingKey } from '../club-record-labels';

const EDIT_LABEL = 'Bearbeiten';

const EDIT_ROUTES = {
  identity: '/manage/club-record/identity',
  contact: '/manage/club-record/contact',
  access: '/manage/club-record/access',
} as const satisfies Record<Section, string>;

interface ClubRecordSectionProps extends PropsWithChildren {
  section: Section;
  highlightedKey: string | null;
  description?: string;
}

export const ClubRecordSection: FC<ClubRecordSectionProps> = ({
  section,
  highlightedKey,
  description,
  children,
}) => {
  const title = CLUB_RECORD_SECTION_TITLES[section];
  const landingKey = toSectionLandingKey(section);

  const action: KkPanelAction = {
    label: EDIT_LABEL,
    icon: 'edit',
    ariaLabel: `${title} bearbeiten`,
    component: Link,
    to: EDIT_ROUTES[section],
  };

  return (
    <KkPanelSection title={title} action={action} description={description}>
      <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
        {children}
      </KkPanel>
    </KkPanelSection>
  );
};
