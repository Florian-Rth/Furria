import { KkSeverityGlyph } from '@furria/ui/KkSeverityGlyph';
import type { FC } from 'react';
import type { PlannerLine } from '../planner-rows';

interface PlannerCheckTrailingProps {
  entry: PlannerLine;
}

export const PlannerCheckTrailing: FC<PlannerCheckTrailingProps> = ({ entry }) => {
  if (entry.findings.length === 0) {
    return null;
  }

  const worst = entry.findings.some((finding) => finding.severity === 'conflict')
    ? 'conflict'
    : 'hint';

  return <KkSeverityGlyph state={worst} size="medium" />;
};
