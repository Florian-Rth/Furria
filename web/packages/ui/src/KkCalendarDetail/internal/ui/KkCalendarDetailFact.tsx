import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';

interface KkCalendarDetailFactProps extends PropsWithChildren {
  icon: KkIconName;
  label: string;
}

export const KkCalendarDetailFact: FC<KkCalendarDetailFactProps> = ({ icon, label, children }) => (
  <Stack direction="row" sx={{ gap: 1.25, py: 1, minWidth: 0, alignItems: 'flex-start' }}>
    <Box aria-hidden sx={{ display: 'grid', color: 'text.secondary', pt: 0.125 }}>
      <KkIcon name={icon} size="small" />
    </Box>
    <Typography
      component="dt"
      variant="caption"
      sx={{ width: '5.5rem', flexShrink: 0, fontWeight: 800, color: 'text.secondary', pt: 0.25 }}
    >
      {label}
    </Typography>
    <Box component="dd" sx={{ m: 0, flex: 1, minWidth: 0, typography: 'body2', fontWeight: 600 }}>
      {children}
    </Box>
  </Stack>
);
