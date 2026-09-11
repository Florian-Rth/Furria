import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { KkEyebrow } from './KkEyebrow';
import { kkTokens } from './tokens';

const MARKER_SIZE = 9;

interface KkPanelHeaderProps {
  title: string;
  action?: ReactNode;
  meta?: string;
}

export const KkPanelHeader: FC<KkPanelHeaderProps> = ({ title, action, meta }) => {
  const metaLine =
    meta === undefined ? null : (
      <KkEyebrow tone="muted" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
        {meta}
      </KkEyebrow>
    );

  return (
    <Stack
      direction="row"
      data-kk-panel-header
      sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}
    >
      <Box
        aria-hidden
        sx={{ width: MARKER_SIZE, height: MARKER_SIZE, bgcolor: 'primary.main', flexShrink: 0 }}
      />
      <Typography
        component="h2"
        sx={{
          fontFamily: kkTokens.font.display,
          fontSize: '0.8125rem',
          letterSpacing: '0.12em',
          lineHeight: 1,
          color: 'text.primary',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      <Box
        aria-hidden
        sx={{ flexGrow: 1, borderBottom: 1.5, borderColor: 'divider', minWidth: 0 }}
      />
      {metaLine}
      {action}
    </Stack>
  );
};
