import { KkCoverageGrid } from '@furria/ui/KkCoverageGrid';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import {
  COVERAGE_EMPTY,
  COVERAGE_GROUP_HEAD,
  COVERAGE_LABEL,
  COVERAGE_LEGEND,
  COVERAGE_PART_HEAD,
  COVERAGE_PART_ICON,
  COVERAGE_TITLE,
  toCoverageColumns,
} from '../group-matcher-hub-copy';
import { toCoverageRows } from '../statement-pool';
import { CoverageGroupRow } from './CoverageGroupRow';

const PART_COLUMN_COUNT = 1;

export const CoverageSection: FC = () => {
  const { pool } = useGroupMatcherHubContext();
  const columns = toCoverageColumns(pool.statements);
  const markColumnCount = columns.length + PART_COLUMN_COUNT;
  const heads = columns.map((column) => (
    <KkCoverageGrid.HeadCell key={column.key} head={column.head} label={column.label} />
  ));
  const rows = toCoverageRows(pool).map((row) => (
    <CoverageGroupRow key={row.group.groupId} row={row} />
  ));
  const grid =
    rows.length === 0 ? (
      <KkNote tone="muted" icon="info">
        {COVERAGE_EMPTY}
      </KkNote>
    ) : (
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkCoverageGrid label={COVERAGE_LABEL} markColumnCount={markColumnCount}>
          <KkCoverageGrid.Head>
            <KkCoverageGrid.HeadCell
              head={COVERAGE_GROUP_HEAD}
              label={COVERAGE_GROUP_HEAD}
              align="start"
            />
            <KkCoverageGrid.HeadCell
              head={COVERAGE_PART_HEAD}
              label={COVERAGE_PART_HEAD}
              icon={COVERAGE_PART_ICON}
            />
            {heads}
          </KkCoverageGrid.Head>
          {rows}
        </KkCoverageGrid>
        <KkCoverageGrid.Legend entries={COVERAGE_LEGEND} />
      </Stack>
    );

  return <KkPanelSection title={COVERAGE_TITLE}>{grid}</KkPanelSection>;
};
