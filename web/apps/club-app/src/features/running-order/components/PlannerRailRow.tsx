import { KkButton } from '@furria/ui/KkButton';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import { Fragment } from 'react';
import { usePlanner } from '../planner-context';
import { FACT_SEPARATOR, toFixLabel, toSeverity } from '../planner-copy';
import type { PlannerRail } from '../planner-rows';
import { PlannerRailText } from './PlannerRailText';

interface PlannerRailRowProps {
  rail: PlannerRail;
}

export const PlannerRailRow: FC<PlannerRailRowProps> = ({ rail }) => {
  const planner = usePlanner();
  const [finding] = rail.findings;

  if (finding === undefined) {
    return null;
  }

  const text = rail.findings.map((each, at) => {
    const separator = at === 0 ? null : FACT_SEPARATOR;

    return (
      <Fragment key={`${each.kind}:${String(at)}`}>
        {separator}
        <PlannerRailText finding={each} />
      </Fragment>
    );
  });
  const fix = planner.railFixOf(rail.key);
  const applyFix = (): void => {
    if (fix !== null) {
      planner.applyFix(fix);
    }
  };
  const action =
    fix === null ? null : (
      <KkButton size="small" variant="outlined" onClick={applyFix}>
        {toFixLabel(planner.lineNameOf(fix.key), fix)}
      </KkButton>
    );
  const worst = rail.findings.some((each) => each.severity === 'conflict')
    ? 'conflict'
    : toSeverity(finding);

  return <KkNumberedList.Rail railKey={rail.key} severity={worst} text={text} action={action} />;
};
