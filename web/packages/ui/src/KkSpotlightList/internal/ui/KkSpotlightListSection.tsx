import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { kkTokens } from '../../../tokens';

interface KkSpotlightListSectionProps {
  title: string;
  meta?: string | null;
  media?: ReactNode;
}

export const KkSpotlightListSection: FC<KkSpotlightListSectionProps> = ({
  title,
  meta = null,
  media,
}) => {
  const metaText =
    meta === null ? null : (
      <Box
        component="span"
        sx={{
          typography: 'caption',
          fontWeight: 700,
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {meta}
      </Box>
    );

  return (
    <Box
      component="li"
      data-kk-spotlight-section
      sx={{ minWidth: 0, bgcolor: 'background.default' }}
    >
      <Stack
        direction="row"
        component="h2"
        sx={{ m: 0, alignItems: 'center', gap: 1, minHeight: '2.5rem', px: 1.5, py: 0.5 }}
      >
        {media}
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            typography: 'caption',
            fontWeight: 900,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            color: 'text.primary',
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Box>
        {metaText}
      </Stack>
    </Box>
  );
};
