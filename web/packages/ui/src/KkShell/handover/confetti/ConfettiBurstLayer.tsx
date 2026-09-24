import Box from '@mui/material/Box';
import type { FC } from 'react';
import { ConfettiChip } from './ConfettiChip';
import type { DockChip, DockChipLayer } from './dock-chips';

const LAYER_DEPTH: Record<DockChipLayer, number> = { behind: -1, front: 1 };

interface ConfettiBurstLayerProps {
  layer: DockChipLayer;
  chips: readonly DockChip[];
  left: number;
  top: number;
  spread: number;
}

export const ConfettiBurstLayer: FC<ConfettiBurstLayerProps> = ({
  layer,
  chips,
  left,
  top,
  spread,
}) => {
  const layerChips = chips
    .filter((chip) => chip.layer === layer)
    .map((chip) => <ConfettiChip key={chip.id} chip={chip} spread={spread} />);
  const anchorStyle = { left, top };

  return (
    <Box
      aria-hidden
      data-kk-dock-burst={layer}
      style={anchorStyle}
      sx={(theme) => ({
        position: 'fixed',
        width: 0,
        height: 0,
        zIndex: theme.zIndex.appBar + LAYER_DEPTH[layer],
        pointerEvents: 'none',
      })}
    >
      {layerChips}
    </Box>
  );
};
