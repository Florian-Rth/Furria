import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkWishChip } from '@furria/ui/KkWishChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ALL_THERE } from '../heute-a-copy';
import type { StripChip } from '../hooks/use-heute-a';

interface HeuteStripLineProps {
  title: string;
  chips: readonly StripChip[];
}

export const HeuteStripLine: FC<HeuteStripLineProps> = ({ title, chips }) => {
  const items = chips.map((chip) => (
    <Stack component="li" key={chip.key} direction="row" sx={{ minWidth: 0 }}>
      <KkWishChip
        icon={chip.icon}
        label={chip.name}
        state={chip.state}
        stateLabel={chip.stateLabel}
      />
    </Stack>
  ));
  const body =
    items.length === 0 ? (
      <KkMeta>{ALL_THERE}</KkMeta>
    ) : (
      <Stack
        component="ul"
        direction="row"
        sx={{ flexWrap: 'wrap', gap: 0.5, m: 0, p: 0, listStyle: 'none', minWidth: 0 }}
      >
        {items}
      </Stack>
    );

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <KkEyebrow tone="muted" sx={{ flexShrink: 0 }}>
        {title}
      </KkEyebrow>
      {body}
    </Stack>
  );
};
