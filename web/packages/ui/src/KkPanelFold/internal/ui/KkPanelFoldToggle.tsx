import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkChip } from '../../../KkChip';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const COLLAPSED_TURN = '90deg';
const EXPANDED_TURN = '-90deg';

interface KkPanelFoldToggleProps {
  label: string;
  flag: string | undefined;
  expanded: boolean;
  contentId: string;
  onToggle: () => void;
}

export const KkPanelFoldToggle: FC<KkPanelFoldToggleProps> = ({
  label,
  flag,
  expanded,
  contentId,
  onToggle,
}) => {
  const turn = expanded ? EXPANDED_TURN : COLLAPSED_TURN;

  const flagChip =
    flag === undefined ? null : (
      <KkChip tone="gold" size="small">
        {flag}
      </KkChip>
    );

  return (
    <Stack
      component="button"
      type="button"
      direction="row"
      aria-expanded={expanded}
      aria-controls={contentId}
      onClick={onToggle}
      data-kk-panel-fold-toggle
      sx={(theme) => ({
        width: '100%',
        minWidth: 0,
        minHeight: kkTokens.tapTarget,
        alignItems: 'center',
        gap: 1.5,
        m: 0,
        px: 0,
        py: 1.25,
        border: 'none',
        background: 'none',
        color: 'inherit',
        textAlign: 'start',
        cursor: 'pointer',
        ...focusRing(theme),
      })}
    >
      <KkIcon
        name="chevron"
        size="small"
        sx={{ flexShrink: 0, color: 'text.secondary', transform: `rotate(${turn})` }}
      />
      <Typography
        component="span"
        sx={{
          typography: 'h4',
          letterSpacing: kkTokens.type.tracking.display,
          lineHeight: 1.3,
          color: 'text.secondary',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        {label}
      </Typography>
      {flagChip}
    </Stack>
  );
};
