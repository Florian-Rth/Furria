import type { NameRow } from '@furria/studio/use-setup-names';
import { KkStepNames } from '@furria/ui/KkStepNames';
import type { FC } from 'react';

interface SetupNameRowProps {
  row: NameRow;
  last: boolean;
}

export const SetupNameRow: FC<SetupNameRowProps> = ({ row, last }) => (
  <KkStepNames.Row
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
