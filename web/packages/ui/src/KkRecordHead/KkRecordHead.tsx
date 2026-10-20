import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { stepFigures, stepLabel } from '../KkStatePill/state-paint';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

interface KkRecordHeadProps {
  eyebrow: string;
  title: string;
  media?: ReactNode;
  chips?: ReactNode;
  progress?: ReactNode;
  cancelled?: boolean;
  sx?: KkSx;
}

export const KkRecordHead: FC<KkRecordHeadProps> = ({
  eyebrow,
  title,
  media,
  chips,
  progress,
  cancelled = false,
  sx,
}) => (
  <Box
    component="header"
    data-kk-record-head
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
        columnGap: { xs: 1.25, sm: 2 },
        minWidth: 0,
        p: { xs: 1.5, sm: 2 },
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {media}
    <Stack sx={{ minWidth: 0, gap: 0.5 }}>
      <Box component="span" sx={{ ...stepLabel, ...stepFigures, whiteSpace: 'normal' }}>
        {eyebrow}
      </Box>
      <Typography
        component="h2"
        variant="h3"
        sx={{
          lineHeight: 1.05,
          minWidth: 0,
          overflowWrap: 'anywhere',
          textDecoration: cancelled ? 'line-through' : 'none',
          color: cancelled ? 'text.secondary' : 'text.primary',
        }}
      >
        {title}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, minWidth: 0, pt: 0.25 }}>
        {chips}
      </Stack>
    </Stack>
    {progress}
  </Box>
);
