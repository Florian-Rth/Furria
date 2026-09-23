import Box from '@mui/material/Box';
import type { FC } from 'react';

interface KkSectionMarkerProps {
  numeral?: string;
}

export const KkSectionMarker: FC<KkSectionMarkerProps> = ({ numeral }) => {
  if (numeral === undefined) {
    return (
      <Box
        aria-hidden
        data-kk-section-square
        sx={{
          width: { xs: '0.875rem', md: '1.125rem' },
          height: { xs: '0.875rem', md: '1.125rem' },
          bgcolor: 'primary.main',
          flexShrink: 0,
          mb: { xs: 0.75, md: 1.25 },
        }}
      />
    );
  }

  return (
    <Box
      aria-hidden
      data-kk-section-numeral
      sx={{
        typography: 'display',
        color: 'primary.main',
        lineHeight: 0.74,
        flexShrink: 0,
      }}
    >
      {numeral}
    </Box>
  );
};
