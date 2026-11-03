import Box from '@mui/material/Box';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS } from '../timeline-paint';
import type { KkTimelineStepBlock } from './KkTimelineStep';
import { KkTimelineStep } from './KkTimelineStep';

const DROP_LEAD_SECONDS = 0.15;

interface KkTimelineStepsProps {
  label: string;
  blocks: readonly KkTimelineStepBlock[];
  activeKey: number | null;
  selectedKey: number | null;
  interactive: boolean;
  revealSeconds: number | null;
  lane?: string;
  onSelect: (key: number) => void;
}

export const KkTimelineSteps: FC<KkTimelineStepsProps> = ({
  label,
  blocks,
  activeKey,
  selectedKey,
  interactive,
  revealSeconds,
  lane,
  onSelect,
}) => {
  const selected = blocks.find((block) => block.key === selectedKey) ?? null;
  const band =
    selected === null ? null : (
      <Box
        aria-hidden
        data-kk-timeline-selection
        style={{
          left: percentOf(selected.from),
          width: percentOf(selected.to - selected.from),
        }}
        sx={(theme) => ({
          position: 'absolute',
          top: `var(${LANE_VARS.ruler})`,
          bottom: 0,
          backgroundColor: inkWash(theme, '7%'),
          borderLeft: `${kkTokens.line.hair}px solid ${(theme.vars ?? theme).palette.text.secondary}`,
          borderRight: `${kkTokens.line.hair}px solid ${(theme.vars ?? theme).palette.text.secondary}`,
          pointerEvents: 'none',
        })}
      />
    );
  const steps = blocks.map((block) => {
    const dropDelay =
      revealSeconds === null ? null : DROP_LEAD_SECONDS + block.from * revealSeconds;

    return (
      <KkTimelineStep
        key={block.key}
        block={block}
        active={block.key === activeKey}
        selected={block.key === selectedKey}
        interactive={interactive}
        dropDelay={dropDelay}
        lane={lane}
        onSelect={onSelect}
      />
    );
  });

  return (
    <Box
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? label : undefined}
      aria-hidden={interactive ? undefined : true}
      data-kk-timeline-steps
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {band}
      {steps}
    </Box>
  );
};
