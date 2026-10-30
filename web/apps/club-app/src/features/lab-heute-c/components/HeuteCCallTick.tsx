import { KkTickRow } from '@furria/ui/KkTickRow';
import type { FC } from 'react';
import type { HeuteCCall } from '../hooks/use-heute-c';

interface HeuteCCallTickProps {
  call: HeuteCCall;
}

export const HeuteCCallTick: FC<HeuteCCallTickProps> = ({ call }) => (
  <li>
    <KkTickRow
      title={call.name}
      span={call.span}
      meta={call.meta}
      checked={call.called}
      dimmed={call.called}
      onToggle={call.toggle}
    />
  </li>
);
