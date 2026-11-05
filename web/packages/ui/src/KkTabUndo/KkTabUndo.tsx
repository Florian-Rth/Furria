import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkButton } from '../KkButton';
import { KkIcon } from '../KkIcon';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkTabUndoRing } from './internal/KkTabUndoRing';

export type KkTabUndoVariant = 'strip' | 'stage';

interface KkTabUndoProps {
  title: string;
  detail: string;
  undoLabel: string;
  remainingMs: number;
  windowMs: number;
  variant?: KkTabUndoVariant;
  onUndo: () => void;
  sx?: KkSx;
}

export const KkTabUndo: FC<KkTabUndoProps> = ({
  title,
  detail,
  undoLabel,
  remainingMs,
  windowMs,
  variant = 'strip',
  onUndo,
  sx,
}) => {
  const undoIcon = <KkIcon name="undo" size="small" />;

  if (variant === 'stage') {
    return (
      <Stack
        role="status"
        data-kk-tab-undo="stage"
        sx={[
          { alignItems: 'center', gap: 1.5, minWidth: 0, textAlign: 'center' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <KkTabUndoRing remainingMs={remainingMs} windowMs={windowMs} size="large" />
        <Stack sx={{ gap: 0.25, alignItems: 'center' }}>
          <Box component="span" sx={{ typography: 'h3', color: 'text.primary' }}>
            {title}
          </Box>
          <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
            {detail}
          </Box>
        </Stack>
        <KkButton
          variant="outlined"
          size="large"
          fullWidth
          startIcon={undoIcon}
          onClick={onUndo}
          sx={{ minHeight: '3.5rem' }}
        >
          {undoLabel}
        </KkButton>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      role="status"
      data-kk-tab-undo="strip"
      sx={[
        {
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
          py: 0.75,
          pl: 0.75,
          pr: 0.5,
          bgcolor: 'background.paper',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
          boxShadow: kkTokens.shadow.floating,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkTabUndoRing remainingMs={remainingMs} windowMs={windowMs} size="small" />
      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.125 }}>
        <Box
          component="span"
          sx={{ typography: 'subtitle2', fontWeight: 800, lineHeight: 1.2, color: 'text.primary' }}
        >
          {title}
        </Box>
        <Box
          component="span"
          sx={{ typography: 'caption', lineHeight: 1.25, color: 'text.secondary' }}
        >
          {detail}
        </Box>
      </Stack>
      <KkButton variant="text" startIcon={undoIcon} onClick={onUndo}>
        {undoLabel}
      </KkButton>
    </Stack>
  );
};
