import { KkPersonRow } from '@furria/ui/KkPersonRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { INTAKE_ROUTE, toIntakeInitials, toIntakeName, toIntakeRowMeta } from '../intake-labels';
import { isSettledIntake } from '../intake-rules';
import type { IntakeSummary } from '../schemas';
import { IntakeStateChip } from './IntakeStateChip';

interface IntakeRowProps {
  intake: IntakeSummary;
  now: Date;
}

export const IntakeRow: FC<IntakeRowProps> = ({ intake, now }) => {
  const initials = toIntakeInitials(intake);
  const name = toIntakeName(intake);
  const meta = toIntakeRowMeta(intake, now);
  const params = { intakeId: String(intake.intakeId) };
  const isSettled = isSettledIntake(intake.state);

  return (
    <KkPersonRow
      initials={initials}
      name={name}
      meta={meta}
      dimmed={isSettled}
      trailing={<IntakeStateChip state={intake.state} size="small" />}
      component={Link}
      to={INTAKE_ROUTE}
      params={params}
    />
  );
};
