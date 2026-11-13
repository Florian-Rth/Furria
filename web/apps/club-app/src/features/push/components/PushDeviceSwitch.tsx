import { KkNote } from '@furria/ui/KkNote';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import { usePushSwitch } from '../hooks/use-push-switch';
import { PUSH_SWITCH_LABEL } from '../push-copy';

export const PushDeviceSwitch: FC = () => {
  const control = usePushSwitch();
  if (control.readiness === undefined) {
    return null;
  }
  if (control.note !== undefined) {
    return <KkNote tone="hint">{control.note}</KkNote>;
  }

  return (
    <KkSwitchRow
      label={PUSH_SWITCH_LABEL}
      checked={control.isOn}
      onChange={control.toggle}
      stateLabel={SWITCH_STATE_LABELS}
      busy={control.isSwitching}
      disabled={control.isSwitching}
    />
  );
};
