import { KkFilterChips, KkReadout, KkSearchField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useSystemLog } from '../hooks/use-system-log';
import {
  LOG_LEVEL_LABEL,
  LOG_LEVEL_OPTIONS,
  LOG_SEARCH_CLEAR,
  LOG_SEARCH_LABEL,
  LOG_SOURCE_LABEL,
  LOG_SOURCE_OPTIONS,
  logsSinceOf,
  SECTION_TITLES,
} from '../system-copy';
import { formatDate } from '../system-format';
import { SystemLogBody } from './SystemLogBody';

const FILTER_GAP = 1;
const SEARCH_NAME = 'system-log-search';

interface SystemLogSectionProps {
  logsSince: string | null;
  nowMs: number;
  dimmed: boolean;
}

export const SystemLogSection: FC<SystemLogSectionProps> = ({ logsSince, nowMs, dimmed }) => {
  const log = useSystemLog(nowMs);
  const since = logsSinceOf(logsSince, formatDate);

  return (
    <KkReadout label={SECTION_TITLES.log} aside={since}>
      <Stack sx={{ gap: FILTER_GAP, minWidth: 0 }}>
        <KkFilterChips
          label={LOG_SOURCE_LABEL}
          options={LOG_SOURCE_OPTIONS}
          value={log.source}
          onChange={log.onSource}
        />
        <KkFilterChips
          label={LOG_LEVEL_LABEL}
          options={LOG_LEVEL_OPTIONS}
          value={log.minimumLevel}
          onChange={log.onMinimumLevel}
        />
        <KkSearchField
          name={SEARCH_NAME}
          label={LOG_SEARCH_LABEL}
          clearLabel={LOG_SEARCH_CLEAR}
          value={log.search}
          onChange={log.onSearch}
        />
      </Stack>
      <SystemLogBody log={log} dimmed={dimmed} />
    </KkReadout>
  );
};
