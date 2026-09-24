import { KkChip, KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { currentSessionYear } from '@/lib/club';
import { toSessionPeriodChip } from '@/lib/state-chips';
import {
  SESSION_SPAN_LABEL,
  toFeeReductionBasisLabel,
  toFeeReductionSpan,
} from '../manage-persons-labels';
import type { PersonFeeReduction } from '../schemas';

const FEE_REDUCTION_ROUTE = '/manage/persons/$personId/fee-reductions/$feeReductionId';

interface PersonFeeReductionRowProps {
  personId: number;
  reduction: PersonFeeReduction;
  highlight: boolean;
}

export const PersonFeeReductionRow: FC<PersonFeeReductionRowProps> = ({
  personId,
  reduction,
  highlight,
}) => {
  const periodChip = toSessionPeriodChip(
    reduction.firstSessionYear,
    reduction.lastSessionYear,
    currentSessionYear(),
  );

  const chip =
    periodChip === null ? undefined : (
      <KkChip tone={periodChip.tone} dot={periodChip.dot} size="small">
        {periodChip.label}
      </KkChip>
    );

  return (
    <KkFactRow
      title={toFeeReductionBasisLabel(reduction.basis)}
      span={toFeeReductionSpan(reduction)}
      spanLabel={SESSION_SPAN_LABEL}
      chip={chip}
      highlight={highlight}
      landing={toLandingKey('feeReduction', reduction.feeReductionId)}
      component={Link}
      to={FEE_REDUCTION_ROUTE}
      params={{ personId: String(personId), feeReductionId: String(reduction.feeReductionId) }}
    />
  );
};
