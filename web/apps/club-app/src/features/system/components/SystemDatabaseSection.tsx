import { KkPanelFold, KkRankBars, KkReadout, useIsMobile } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import { SECTION_TITLES, TABLES_LABEL } from '../system-copy';
import { databaseViewOf } from '../system-view';

interface SystemDatabaseSectionProps {
  status: SystemStatus;
  dimmed: boolean;
}

export const SystemDatabaseSection: FC<SystemDatabaseSectionProps> = ({ status, dimmed }) => {
  const isMobile = useIsMobile();
  const database = databaseViewOf(status);
  const facts = database.facts.map((fact) => (
    <KkReadout.Fact key={fact.key} label={fact.label} value={fact.value} level={fact.level} />
  ));
  const bars = <KkRankBars label={TABLES_LABEL} bars={database.tables} />;
  const tablesOpen = (
    <Stack sx={{ minWidth: 0 }}>
      <KkReadout.Note text={TABLES_LABEL} />
      {bars}
    </Stack>
  );
  const tablesFolded = <KkPanelFold label={TABLES_LABEL}>{bars}</KkPanelFold>;
  const tablesShown = isMobile ? tablesFolded : tablesOpen;
  const tables = database.tables.length === 0 ? null : tablesShown;

  return (
    <KkReadout label={SECTION_TITLES.database} dimmed={dimmed}>
      <KkReadout.Facts>{facts}</KkReadout.Facts>
      {tables}
    </KkReadout>
  );
};
