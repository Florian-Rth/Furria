import type { NameRow } from '@furria/studio/use-setup-names';
import { KkSsNames } from '@furria/ui/KkSsNames';
import type { FC } from 'react';

interface SetupNameRowProps {
  row: NameRow;
  last: boolean;
}

export const SetupNameRow: FC<SetupNameRowProps> = ({ row, last }) => (
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
