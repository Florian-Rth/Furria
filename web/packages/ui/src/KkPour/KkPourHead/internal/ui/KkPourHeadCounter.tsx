import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../../internal/gold-ink';
import { headCellPaint } from './head-cell-paint';

interface KkPourHeadCounterProps {
  value: string;
  label: string;
  ariaLabel: string;
  attention: boolean;
  selected: boolean;
  onSelect: () => void;
}

export const KkPourHeadCounter: FC<KkPourHeadCounterProps> = ({
  value,
  label,
  ariaLabel,
  attention,
  selected,
  onSelect,
}) => (
  <ButtonBase
    aria-pressed={selected}
    aria-label={ariaLabel}
    onClick={onSelect}
    data-kk-pour-head-counter
    sx={[headCellPaint, { flex: 1 }]}
  >
    <Stack sx={{ minWidth: 0, gap: 0.25 }}>
      <Typography
        variant="h3"
        component="span"
        noWrap
        sx={[
          {
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.1,
          },
          attention ? goldInkOf : {},
        ]}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          lineHeight: 1.25,
          overflowWrap: 'break-word',
        }}
      >
        {label}
      </Typography>
    </Stack>
  </ButtonBase>
);
