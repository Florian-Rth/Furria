import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { ADD_FEE_REDUCTION_ACTION_LABEL, PERSON_SECTION_TITLES } from '../manage-persons-labels';
import { toClosedHistoryLine } from '../person-archive';
import { toSectionLandingKey } from '../person-identity';
import type { PersonDetails } from '../schemas';
import { PersonFeeReductionRow } from './PersonFeeReductionRow';

const ADD_LABEL = 'Ermäßigung';
const EMPTY_TITLE = 'KEINE ERMÄSSIGUNG';
const EMPTY_DESCRIPTION = 'Keine Beitragsermäßigung hinterlegt.';
const FEE_REDUCTIONS_NEW_ROUTE = '/manage/persons/$personId/fee-reductions/new';

interface PersonFeeReductionsPanelProps {
  person: PersonDetails;
  highlightedKey: string | null;
}

export const PersonFeeReductionsPanel: FC<PersonFeeReductionsPanelProps> = ({
  person,
  highlightedKey,
}) => {
  const isArchived = person.archive !== null;
  const closedNote = isArchived ? (
    <KkNote>{toClosedHistoryLine(person.firstName, 'Beitragsermäßigungen')}</KkNote>
  ) : null;

  const createAction: KkPanelAction = {
    label: ADD_LABEL,
    icon: 'add',
    ariaLabel: ADD_FEE_REDUCTION_ACTION_LABEL,
    component: Link,
    to: FEE_REDUCTIONS_NEW_ROUTE,
    params: { personId: String(person.personId) },
  };

  const action = isArchived ? undefined : createAction;

  const rows = person.feeReductions.map((reduction) => (
    <PersonFeeReductionRow
      key={reduction.feeReductionId}
      personId={person.personId}
      reduction={reduction}
      linked={!isArchived}
      highlight={highlightedKey === toLandingKey('feeReduction', reduction.feeReductionId)}
    />
  ));

  const isEmpty = rows.length === 0;
  const landingKey = toSectionLandingKey('feeReductions', person.personId);
  const body = isEmpty ? (
    <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.feeReductions} action={action}>
      {closedNote}
      <KkPanel
        variant={isEmpty ? 'block' : 'list'}
        highlight={highlightedKey === landingKey}
        landing={landingKey}
      >
        {body}
      </KkPanel>
    </KkPanelSection>
  );
};
