import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { KkIcon } from '../../../KkIcon';

export interface KkReadinessSlot {
  id: string;
  label: string;
  done: boolean;
}

interface KkPressBarReadinessProps {
  label: string;
  slots: readonly KkReadinessSlot[];
  onSelect: (id: string) => void;
}

export const KkPressBarReadiness: FC<KkPressBarReadinessProps> = ({ label, slots, onSelect }) => {
  const marks = slots.map((slot) => {
    const select = (): void => {
      onSelect(slot.id);
    };
    const face = slot.done ? (
      <Stack
        direction="row"
        sx={{ gap: 0.25, alignItems: 'center', px: 0.5, color: 'text.secondary' }}
      >
        <KkIcon name="check" size="small" />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {slot.label}
        </Typography>
      </Stack>
    ) : (
      <ButtonBase
        onClick={select}
        sx={(theme) => ({
          px: 1,
          py: 0.25,
          borderRadius: 1,
          border: 1,
          borderColor: 'warning.main',
          bgcolor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.warning.main} 14%, transparent)`,
          typography: 'caption',
          fontWeight: 800,
          ...goldInkOf(theme),
          ...focusRing(theme),
        })}
      >
        {slot.label}
      </ButtonBase>
    );

    return (
      <Stack
        key={slot.id}
        component="li"
        data-kk-readiness={slot.done ? 'done' : 'open'}
        sx={{ listStyle: 'none' }}
      >
        {face}
      </Stack>
    );
  });

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        gap: 1,
        alignItems: 'center',
        minWidth: 0,
        flexWrap: 'wrap',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Stack
        component="ul"
        direction="row"
        aria-label={label}
        sx={{ gap: 0.75, m: 0, p: 0, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {marks}
      </Stack>
    </Stack>
  );
};
