import { KkTeleprinter } from '@furria/ui';
import type { FC } from 'react';
import type { LogRowView } from '../hooks/use-system-log';
import { SystemLogLine } from './SystemLogLine';

interface SystemLogRowProps {
  row: LogRowView;
}

export const SystemLogRow: FC<SystemLogRowProps> = ({ row }) => {
  if (row.kind === 'day') {
    return <KkTeleprinter.Day label={row.label} />;
  }

  return <SystemLogLine line={row} />;
};
