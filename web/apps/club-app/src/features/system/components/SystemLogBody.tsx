import { KkEmptyState, KkReadout, KkSkeletonBlock, KkTeleprinter } from '@furria/ui';
import type { FC } from 'react';
import type { SystemLog } from '../hooks/use-system-log';
import {
  LOG_EMPTY_DESCRIPTION,
  LOG_EMPTY_TITLE,
  LOG_LABEL,
  LOG_MORE_LABEL,
  LOG_OLDER_FAILED,
  LOG_OLDER_RETRY_LABEL,
} from '../system-copy';
import { SystemLogFailure } from './SystemLogFailure';
import { SystemLogRow } from './SystemLogRow';

const LOADING_LINES = 8;

interface SystemLogBodyProps {
  log: SystemLog;
  dimmed: boolean;
}

export const SystemLogBody: FC<SystemLogBodyProps> = ({ log, dimmed }) => {
  if (log.body === 'loading') {
    return <KkSkeletonBlock lines={LOADING_LINES} />;
  }
  if (log.failure !== null) {
    return (
      <SystemLogFailure message={log.failure} retrying={log.isRetrying} onRetry={log.onRetry} />
    );
  }
  if (log.body === 'empty') {
    return (
      <KkEmptyState title={LOG_EMPTY_TITLE} description={LOG_EMPTY_DESCRIPTION} size="panel" />
    );
  }

  const fresh =
    log.fresh === null ? null : <KkTeleprinter.Fresh label={log.fresh} onReveal={log.onReveal} />;
  const olderFailure = log.olderFailed ? (
    <KkReadout.Note text={LOG_OLDER_FAILED} level="broken" />
  ) : null;
  const moreLabel = log.olderFailed ? LOG_OLDER_RETRY_LABEL : LOG_MORE_LABEL;
  const more = log.hasOlder ? (
    <KkTeleprinter.More label={moreLabel} loading={log.isLoadingOlder} onLoad={log.onLoadOlder} />
  ) : null;
  const rows = log.rows.map((row) => <SystemLogRow key={row.key} row={row} />);

  return (
    <KkTeleprinter label={LOG_LABEL} dimmed={dimmed}>
      {fresh}
      <KkTeleprinter.Lines>{rows}</KkTeleprinter.Lines>
      {olderFailure}
      {more}
    </KkTeleprinter>
  );
};
