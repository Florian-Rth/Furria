import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import { usePushSwitch } from '../hooks/use-push-switch';
import { PUSH_SECTION_TITLE, PUSH_SWITCH_LABEL } from '../push-copy';

export const PushDevicePanel: FC = () => {
  const control = usePushSwitch();
  if (control.readiness === undefined) {
    return null;
  }

  const body =
    control.note === undefined ? (
      <KkSwitchRow
        label={PUSH_SWITCH_LABEL}
        checked={control.isOn}
        onChange={control.toggle}
        stateLabel={SWITCH_STATE_LABELS}
        busy={control.isSwitching}
        disabled={control.isSwitching}
      />
    ) : (
      <KkNote tone="hint">{control.note}</KkNote>
    );

  return (
    <KkPanelSection title={PUSH_SECTION_TITLE}>
      <KkPanel variant="block">{body}</KkPanel>
    </KkPanelSection>
  );
};
