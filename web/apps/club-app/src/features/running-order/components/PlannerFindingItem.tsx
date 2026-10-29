import { KkButton } from '@furria/ui/KkButton';
import { KkFindingLine } from '@furria/ui/KkFindingLine';
import type { FC } from 'react';
import { toFindingSentence, toFindingTitle } from '@/features/running-order/running-order-copy';
import type { ReviewFinding } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import { toFindingRuleLabel, toFixLabel, toSeverity } from '../planner-copy';
import type { PlannerFix } from '../planner-fixes';

interface PlannerFindingItemProps {
  finding: ReviewFinding;
  fix: PlannerFix | null;
}

export const PlannerFindingItem: FC<PlannerFindingItemProps> = ({ finding, fix }) => {
  const planner = usePlanner();
  const applyFix = (): void => {
    if (fix !== null) {
      planner.applyFix(fix);
    }
  };
  const text = toFindingSentence({
    kind: finding.kind,
    lineNames: finding.lineKeys.map((key) => planner.lineNameOf(key)),
    personNames: planner.personNamesOf(finding.personIds),
    ruleSentence: toFindingRuleLabel(planner.draft, finding, planner.nameOf),
  });
  const action =
    fix === null ? null : (
      <KkButton size="small" variant="outlined" onClick={applyFix}>
        {toFixLabel(planner.lineNameOf(fix.key), fix)}
      </KkButton>
    );

  return (
    <KkFindingLine
      severity={toSeverity(finding)}
      title={toFindingTitle(finding.kind)}
      text={text}
      action={action}
    />
  );
};
