import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelHeaderSize = 'small' | 'medium';

const MARKER_SIZE = 9;
const RULE_BLEED = '26px';

const titleSizes: Record<KkPanelHeaderSize, string> = {
  small: kkTokens.type.sectionTitle,
  medium: kkTokens.type.blockTitle,
};

const ruleImage = (theme: Theme): string =>
  `linear-gradient(to right, ${(theme.vars ?? theme).palette.primary.main} 0, ${(theme.vars ?? theme).palette.divider} ${RULE_BLEED})`;

interface KkPanelHeaderProps {
  title: string;
  action?: ReactNode;
  meta?: string;
  size?: KkPanelHeaderSize;
  sx?: KkSx;
}

export const KkPanelHeader: FC<KkPanelHeaderProps> = ({
  title,
  action,
  meta,
  size = 'small',
  sx,
}) => {
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
      sx={[{ alignItems: 'center', gap: 1.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        aria-hidden
        sx={{ width: MARKER_SIZE, height: MARKER_SIZE, bgcolor: 'primary.main', flexShrink: 0 }}
      />
      <Typography
        component="h2"
        sx={{
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          fontSize: titleSizes[size],
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
        sx={(theme) => ({
          flexGrow: 1,
          minWidth: 0,
          height: kkTokens.line.hair,
          backgroundImage: ruleImage(theme),
        })}
      />
      {metaLine}
      {action}
    </Stack>
  );
};
