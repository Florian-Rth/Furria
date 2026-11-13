import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import type { PushTopicRow } from '../hooks/use-push-topics';
import type { PushTopic } from '../schemas';

interface PushTopicSwitchProps {
  row: PushTopicRow;
  onToggle: (topic: PushTopic, isEnabled: boolean) => void;
}

export const PushTopicSwitch: FC<PushTopicSwitchProps> = ({ row, onToggle }) => {
  const toggle = (isEnabled: boolean): void => {
    onToggle(row.topic, isEnabled);
  };

  return (
    <KkSwitchRow
      label={row.label}
      description={row.description}
      checked={row.isEnabled}
      onChange={toggle}
      stateLabel={SWITCH_STATE_LABELS}
    />
  );
};
