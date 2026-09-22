import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { ADD_FEE_REDUCTION_ACTION_LABEL, PERSON_SECTION_TITLES } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';
import { PersonFeeReductionRow } from './PersonFeeReductionRow';

const ADD_LABEL = 'Ermäßigung';
const EMPTY_TITLE = 'KEINE ERMÄSSIGUNG';
const EMPTY_DESCRIPTION =
  'Für diese Person ist keine Beitragsermäßigung hinterlegt. Über „+ Ermäßigung“ trägst du eine ein.';
const FEE_REDUCTIONS_NEW_ROUTE = '/manage/persons/$personId/fee-reductions/new';

interface PersonFeeReductionsPanelProps {
  person: PersonDetails;
  highlightedKey: string | null;
}

export const PersonFeeReductionsPanel: FC<PersonFeeReductionsPanelProps> = ({
  person,
  highlightedKey,
}) => {
  const action: KkPanelAction = {
    label: ADD_LABEL,
    icon: 'add',
    ariaLabel: ADD_FEE_REDUCTION_ACTION_LABEL,
    component: Link,
    to: FEE_REDUCTIONS_NEW_ROUTE,
    params: { personId: String(person.personId) },
  };

  const rows = person.feeReductions.map((reduction) => (
    <PersonFeeReductionRow
      key={reduction.feeReductionId}
      personId={person.personId}
      reduction={reduction}
      highlight={highlightedKey === toLandingKey('feeReduction', reduction.feeReductionId)}
    />
  ));

  const isEmpty = rows.length === 0;
  const body = isEmpty ? (
    <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.feeReductions} action={action}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
