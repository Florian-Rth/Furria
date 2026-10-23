import { KkGroupToneDot } from '@furria/ui/KkGroupToneDot';
import type { FC } from 'react';
import type { ActRef, CastPerson } from '@/features/running-order/schemas';
import { toCastFact, toKindFact } from '../planner-copy';

interface PlannerLineFactProps {
  act: ActRef;
  cast: readonly CastPerson[];
  withGroup?: boolean;
  withCast?: boolean;
  compact?: boolean;
}

export const PlannerLineFact: FC<PlannerLineFactProps> = ({
  act,
  cast,
  withGroup = true,
  withCast = true,
  compact = false,
}) => {
  const absent = cast.filter((person) => person.absent).length;
  const present = cast.length - absent;
  const showsGroup = withGroup && !compact && act.group !== null;
  const kind =
    act.group !== null && (act.kind === null || act.kind === 'point')
      ? null
      : toKindFact(act.kind ?? 'point');
  const kindPart = kind === null ? null : <span>{kind}</span>;
  const castPart =
    cast.length === 0 || !withCast ? null : <span>{toCastFact(present, absent)}</span>;
  const dot =
    (showsGroup || compact) && act.group !== null ? <KkGroupToneDot tone={act.group.tone} /> : null;
  const group = showsGroup ? <span>{act.group?.name}</span> : null;

  return (
    <>
      {dot}
      {group}
      {kindPart}
      {castPart}
    </>
  );
};
