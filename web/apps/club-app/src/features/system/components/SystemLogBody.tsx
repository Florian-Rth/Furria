import { KkEmptyState, KkReadout, KkSkeletonBlock, KkTeleprinter } from '@furria/ui';
import type { FC } from 'react';
import type { SystemLog } from '../hooks/use-system-log';
import {
  LOG_EMPTY_DESCRIPTION,
  LOG_EMPTY_TITLE,
  LOG_FAILED,
  LOG_LABEL,
  LOG_MORE_LABEL,
} from '../system-copy';
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
  if (log.body === 'failed') {
    return <KkReadout.Note text={LOG_FAILED} level="broken" />;
  }
  if (log.body === 'empty') {
    return (
      <KkEmptyState title={LOG_EMPTY_TITLE} description={LOG_EMPTY_DESCRIPTION} size="panel" />
    );
  }

  const fresh =
    log.fresh === null ? null : <KkTeleprinter.Fresh label={log.fresh} onReveal={log.onReveal} />;
  const more = log.hasOlder ? (
    <KkTeleprinter.More
      label={LOG_MORE_LABEL}
      loading={log.isLoadingOlder}
      onLoad={log.onLoadOlder}
    />
  ) : null;
  const rows = log.rows.map((row) => <SystemLogRow key={row.key} row={row} />);

  return (
    <KkTeleprinter label={LOG_LABEL} dimmed={dimmed}>
      {fresh}
      <KkTeleprinter.Lines>{rows}</KkTeleprinter.Lines>
      {more}
    </KkTeleprinter>
  );
};
