import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { FactEditor } from '../hooks/use-fact-editor';
import { ADD_MEMBERSHIP_ACTION_LABEL, PERSON_SECTION_TITLES } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';
import { MembershipEditor } from './MembershipEditor';
import { PersonMembershipRow } from './PersonMembershipRow';

const ADD_LABEL = 'Zeitraum';
const EMPTY_TITLE = 'NOCH KEINE MITGLIEDSCHAFT';
const EMPTY_DESCRIPTION =
  'Diese Person ist nie Mitglied gewesen. Trag einen Zeitraum ein, sobald der Beitritt feststeht.';

interface PersonMembershipsPanelProps {
  person: PersonDetails;
  editor: FactEditor;
}

export const PersonMembershipsPanel: FC<PersonMembershipsPanelProps> = ({ person, editor }) => {
  const isAdding = editor.membership !== null && editor.membership.membershipId === null;

  const startAdd = (): void => {
    editor.openMembership(null);
  };

  const action: KkPanelAction = {
    label: ADD_LABEL,
    icon: 'add',
    ariaLabel: ADD_MEMBERSHIP_ACTION_LABEL,
    onClick: startAdd,
  };

  const addEditor = isAdding ? (
    <MembershipEditor
      personId={person.personId}
      membership={null}
      onClose={editor.close}
      onSaved={editor.close}
    />
  ) : null;

  const rows = person.memberships.map((membership) => (
    <PersonMembershipRow
      key={membership.membershipId}
      personId={person.personId}
      firstName={person.firstName}
      membership={membership}
      editor={editor}
    />
  ));

  const isEmpty = rows.length === 0 && !isAdding;

  const body = isEmpty ? (
    <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    <>
      {addEditor}
      {rows}
    </>
  );

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.memberships} action={action}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
