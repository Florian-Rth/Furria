import type { KkCountShift } from '@furria/ui/KkCountShifts';
import { KkCountShifts } from '@furria/ui/KkCountShifts';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { NOT_PROVEN, PROPOSAL_SHIFTS_LABEL, toMovedCount, toShiftLabel } from '../planner-copy';

export const PlannerProposalShifts: FC = () => {
  const { suggestion } = usePlanner();
  const shifts: KkCountShift[] = suggestion.shifts.map((shift) => ({
    id: shift.kind,
    state: shift.severity,
    before: shift.before,
    after: shift.after,
    label: toShiftLabel(shift.kind),
  }));
  const moved = suggestion.rows.filter((row) => !row.fromTray).length;
  const extra = moved === 0 ? null : toMovedCount(moved);

  return (
    <KkCountShifts
      label={PROPOSAL_SHIFTS_LABEL}
      shifts={shifts}
      extra={extra}
      note={suggestion.proven ? null : NOT_PROVEN}
    />
  );
};
