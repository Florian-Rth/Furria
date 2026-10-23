import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import type { KkSeverity } from '@furria/ui/KkSeverityGlyph';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { MODE_ICONS, MODE_LABELS, MODE_SWITCH_LABEL, toModeCountLabel } from '../planner-copy';
import type { PlannerMode } from '../schemas';
import { PLANNER_MODES, PlannerModeSchema } from '../schemas';

const severityOf = (conflicts: number, hints: number): KkSeverity | null => {
  if (conflicts > 0) {
    return 'conflict';
  }

  return hints > 0 ? 'hint' : null;
};

const COUNTED_MODES: readonly PlannerMode[] = ['pick'];

export const PlannerModeSwitch: FC = () => {
  const planner = usePlanner();
  const checkSeverity = severityOf(planner.tally.conflicts, planner.tally.hints);
  const items: KkSegmentSwitchItem[] = PLANNER_MODES.map((mode) => ({
    id: mode,
    label: MODE_LABELS[mode],
    icon: MODE_ICONS[mode],
    count: COUNTED_MODES.includes(mode) ? planner.counts[mode] : null,
    countLabel: toModeCountLabel(mode, planner.counts[mode]),
    severity: mode === 'check' ? checkSeverity : null,
  }));
  const choose = (id: string): void => {
    const parsed = PlannerModeSchema.safeParse(id);

    if (parsed.success) {
      planner.setMode(parsed.data);
    }
  };

  return (
    <KkSegmentSwitch
      label={MODE_SWITCH_LABEL}
      items={items}
      value={planner.mode}
      onChange={choose}
    />
  );
};
