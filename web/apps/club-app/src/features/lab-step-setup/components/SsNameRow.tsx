import { KkSsNames } from '@furria/ui/KkSsNames';
import type { FC } from 'react';
import type { NameRow } from '../hooks/use-setup-names';

interface SsNameRowProps {
  row: NameRow;
  last: boolean;
}

export const SsNameRow: FC<SsNameRowProps> = ({ row, last }) => (
  <KkSsNames.Row
    number={row.number}
    label={row.label}
    value={row.value}
    placeholder={row.placeholder}
    current={row.current}
    last={last}
    onChange={row.change}
    onCommit={row.commit}
    onFocus={row.focus}
  />
);
