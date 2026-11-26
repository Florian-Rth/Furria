import { KkTallyStrip } from '@furria/ui/KkTallyStrip';
import type { FC } from 'react';
import {
  COUNTERS,
  COUNTERS_LABEL,
  STRIP_LABEL,
  toCounterAria,
  toRingCaption,
  toRingLabel,
} from '../board-hub-copy';

const SAMPLE_HELD = 5;
const SAMPLE_ACTIVE = 6;
const SAMPLE_COUNTS = { vacant: 1, ending: 0, handover: 1, offline: 2 } as const;

const keep = (): void => {};

export const BoardHelpStripPreview: FC = () => {
  const counters = COUNTERS.map((view) => (
    <KkTallyStrip.Counter
      key={view.id}
      icon={view.icon}
      label={view.label}
      count={SAMPLE_COUNTS[view.id]}
      ariaLabel={toCounterAria(view.label, SAMPLE_COUNTS[view.id])}
      tone={view.attention ? 'attention' : 'ink'}
      selected={false}
      onSelect={keep}
    />
  ));

  return (
    <KkTallyStrip label={STRIP_LABEL}>
      <KkTallyStrip.Bar>
        <KkTallyStrip.Summary
          ringLabel={toRingLabel(SAMPLE_HELD, SAMPLE_ACTIVE)}
          value={SAMPLE_HELD}
          total={SAMPLE_ACTIVE}
          caption={toRingCaption(SAMPLE_ACTIVE)}
        />
        <KkTallyStrip.Counters label={COUNTERS_LABEL}>{counters}</KkTallyStrip.Counters>
      </KkTallyStrip.Bar>
    </KkTallyStrip>
  );
};
