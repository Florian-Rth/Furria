import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import type { FC } from 'react';
import { MODE_ICONS, MODE_LABELS, MODE_SWITCH_LABEL, toModeCountLabel } from '../planner-copy';
import { PLANNER_MODES } from '../schemas';

const SAMPLE_PICKED = 9;
const SAMPLE_MODE = 'order';

const ITEMS: readonly KkSegmentSwitchItem[] = PLANNER_MODES.map((mode) => ({
  id: mode,
  label: MODE_LABELS[mode],
  icon: MODE_ICONS[mode],
  count: mode === 'pick' ? SAMPLE_PICKED : null,
  countLabel: toModeCountLabel(mode, SAMPLE_PICKED),
  severity: mode === 'check' ? 'hint' : null,
}));

const keep = (): void => {};

export const RunningOrderHelpModesPreview: FC = () => (
  <KkSegmentSwitch label={MODE_SWITCH_LABEL} items={ITEMS} value={SAMPLE_MODE} onChange={keep} />
);
