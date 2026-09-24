import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { ADD_MEMBERSHIP_ACTION_LABEL, PERSON_SECTION_TITLES } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';
import { PersonMembershipRow } from './PersonMembershipRow';

const ADD_LABEL = 'Zeitraum';
const EMPTY_TITLE = 'NOCH KEINE MITGLIEDSCHAFT';
const EMPTY_DESCRIPTION = 'Diese Person war noch nie Mitglied.';
const MEMBERSHIPS_NEW_ROUTE = '/manage/persons/$personId/memberships/new';

interface PersonMembershipsPanelProps {
  person: PersonDetails;
  highlightedKey: string | null;
}

export const PersonMembershipsPanel: FC<PersonMembershipsPanelProps> = ({
  person,
  highlightedKey,
}) => {
  const action: KkPanelAction = {
    label: ADD_LABEL,
    icon: 'add',
    ariaLabel: ADD_MEMBERSHIP_ACTION_LABEL,
    component: Link,
    to: MEMBERSHIPS_NEW_ROUTE,
    params: { personId: String(person.personId) },
  };

  const rows = person.memberships.map((membership) => (
    <PersonMembershipRow
      key={membership.membershipId}
      personId={person.personId}
      membership={membership}
      highlight={highlightedKey === toLandingKey('membership', membership.membershipId)}
    />
  ));

  const isEmpty = rows.length === 0;
  const body = isEmpty ? (
    <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.memberships} action={action}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
