import { KkNameButton } from '@furria/ui/KkNameButton';
import type { FC } from 'react';
import type { ReviewFinding } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import {
  NAMED_RAIL_KINDS,
  toFindingRuleLabel,
  toNameParts,
  toPersonOpenLabel,
  toRailTail,
  toRailText,
} from '../planner-copy';

interface PlannerRailTextProps {
  finding: ReviewFinding;
}

export const PlannerRailText: FC<PlannerRailTextProps> = ({ finding }) => {
  const planner = usePlanner();
  const people = planner.peopleOf(finding.personIds);

  if (!NAMED_RAIL_KINDS.includes(finding.kind) || people.length === 0) {
    const ruleLabel = toFindingRuleLabel(planner.draft, finding, planner.nameOf);
    const text = toRailText(
      finding,
      people.map((person) => person.name),
      ruleLabel,
    );

    return <>{text}</>;
  }

  const parts = toNameParts(people.map((person) => person.name)).map((part, at) => {
    const person = part.personIndex === null ? undefined : people[part.personIndex];

    if (person === undefined) {
      return part.text;
    }

    const open = (): void => {
      planner.openPerson(person.personId);
    };

    return (
      <KkNameButton
        key={`${person.personId}:${String(at)}`}
        name={person.name}
        label={toPersonOpenLabel(person.name)}
        onSelect={open}
      />
    );
  });
  const tail = toRailTail(finding.kind, people.length);

  return (
    <>
      {parts}
      {tail}
    </>
  );
};
