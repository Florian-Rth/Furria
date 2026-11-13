import { KkPanel } from '@furria/ui/KkPanel';
import type { FC } from 'react';
import type { PushTopicsControl } from '../hooks/use-push-topics';
import { PushTopicSwitch } from './PushTopicSwitch';

interface PushTopicSwitchesProps {
  control: PushTopicsControl;
}

export const PushTopicSwitches: FC<PushTopicSwitchesProps> = ({ control }) => {
  const switches = control.rows.map((row) => (
    <PushTopicSwitch key={row.topic} row={row} onToggle={control.toggle} />
  ));

  return <KkPanel variant="block">{switches}</KkPanel>;
};
