import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkAspect } from './image-aspect';
import { aspectOf } from './image-aspect';
import type { KkGroupTone } from './internal/group-tone';
import { lineClamp } from './internal/line-clamp';
import type { KkFrameMark, KkFrameState } from './KkFrame';
import { KkFrame } from './KkFrame';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkSlotFlagTone = 'red' | 'gold' | 'muted';

export interface KkSlotFlag {
  text: string;
  tone: KkSlotFlagTone;
}

export interface KkSlotRowPosition {
  id: string;
  label: string;
  aspect: KkAspect;
  edge: string;
  source?: string;
  state?: KkFrameState;
  progress?: number;
  mark?: KkFrameMark;
  vacancy?: KkGroupTone;
}

const { website, gallery } = kkTokens;

const flagColor: Record<KkSlotFlagTone, string> = {
  red: 'error.main',
  gold: 'warning.main',
  muted: 'text.secondary',
};

const frameWidthOf = (aspect: KkAspect): { xs: number; desktop: number } => ({
  xs: Math.round(website.slotFrameHeight.xs * aspectOf(aspect)),
  desktop: Math.round(website.slotFrameHeight.desktop * aspectOf(aspect)),
});

interface KkSlotRowProps {
  sketch: ReactNode;
  title: string;
  facts: string;
  description: string;
  flag?: KkSlotFlag;
  positions: readonly KkSlotRowPosition[];
  selectedPosition: number | null;
  onSelectPosition: (index: number) => void;
  sx?: KkSx;
}

export const KkSlotRow: FC<KkSlotRowProps> = ({
  sketch,
  title,
  facts,
  description,
  flag,
  positions,
  selectedPosition,
  onSelectPosition,
  sx,
}) => {
  const frames = positions.map((position, index) => {
    const select = (): void => {
      onSelectPosition(index);
    };
    return (
      <Box key={position.id} sx={{ width: frameWidthOf(position.aspect), flexShrink: 0 }}>
        <KkFrame
          label={position.label}
          source={position.source}
          number={position.edge}
          state={position.state}
          progress={position.progress}
          mark={position.mark}
          vacancy={position.vacancy}
          aspect={position.aspect}
          selected={selectedPosition === index}
          onSelect={select}
        />
      </Box>
    );
  });
  const flagLine =
    flag === undefined ? null : (
      <Typography
        component="span"
        sx={(theme) => ({
          ...theme.typography.overline,
          fontFamily: kkTokens.font.display,
          letterSpacing: kkTokens.type.tracking.label,
          lineHeight: 1.2,
          color: flagColor[flag.tone],
          flexShrink: 0,
          textAlign: 'right',
          maxWidth: '40%',
        })}
      >
        {flag.text}
      </Typography>
    );

  return (
    <Stack
      component="article"
      aria-label={title}
      data-kk-slot-row
      sx={[
        {
          minWidth: 0,
          flexDirection: { xs: 'column', desktop: 'row' },
          alignItems: { xs: 'stretch', desktop: 'flex-start' },
          rowGap: 0.75,
          columnGap: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        direction="row"
        sx={{ flex: 1, alignItems: 'flex-start', columnGap: 1.25, minWidth: 0 }}
      >
        {sketch}
        <Stack sx={{ flex: 1, minWidth: 0, rowGap: 0.25 }}>
          <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', ...lineClamp(1) }}>
            {facts}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', ...lineClamp(2) }}>
            {description}
          </Typography>
        </Stack>
        {flagLine}
      </Stack>
      <Stack
        direction="row"
        sx={{
          flexWrap: 'wrap',
          justifyContent: { xs: 'flex-start', desktop: 'flex-end' },
          gap: `${gallery.gutter * 2}px`,
          minWidth: 0,
          maxWidth: { desktop: '52%' },
          flexShrink: 0,
        }}
      >
        {frames}
      </Stack>
    </Stack>
  );
};
