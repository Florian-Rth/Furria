import { KkCoverageGrid } from '@furria/ui/KkCoverageGrid';
import type { FC } from 'react';
import { COVERAGE_LEGEND } from '../group-matcher-hub-copy';

export const GroupMatcherHelpLegendPreview: FC = () => (
  <KkCoverageGrid.Legend entries={COVERAGE_LEGEND} />
);
