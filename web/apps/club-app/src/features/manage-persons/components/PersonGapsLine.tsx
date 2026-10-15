import { KkInlineLink, KkNote } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PersonGap } from '../person-identity';

const LEAD = 'Noch nichts eingetragen: ';
const SEPARATOR = ' · ';
const FEE_REDUCTIONS_NEW_ROUTE = '/manage/persons/$personId/fee-reductions/new';

const GAP_LABELS: Record<PersonGap, string> = {
  feeReductions: 'Beitragsermäßigung',
  ties: 'Gruppen & Rollen',
  keys: 'Schlüssel',
};

interface PersonGapsLineProps {
  personId: number;
  gaps: readonly PersonGap[];
  canAddFeeReduction: boolean;
}

export const PersonGapsLine: FC<PersonGapsLineProps> = ({ personId, gaps, canAddFeeReduction }) => {
  if (gaps.length === 0) {
    return null;
  }

  const params = { personId: String(personId) };
  const lastIndex = gaps.length - 1;
  const items = gaps.map((gap, index) => {
    const separator = index === lastIndex ? null : SEPARATOR;
    const label =
      gap === 'feeReductions' && canAddFeeReduction ? (
        <KkInlineLink component={Link} to={FEE_REDUCTIONS_NEW_ROUTE} params={params}>
          {GAP_LABELS[gap]}
        </KkInlineLink>
      ) : (
        GAP_LABELS[gap]
      );

    return (
      <span key={gap}>
        {label}
        {separator}
      </span>
    );
  });

  return (
    <KkNote tone="muted">
      {LEAD}
      {items}
    </KkNote>
  );
};
