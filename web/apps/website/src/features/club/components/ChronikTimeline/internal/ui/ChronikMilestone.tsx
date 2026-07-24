import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Milestone } from '@/features/club/chronik-content';

interface ChronikMilestoneProps {
  milestone: Milestone;
  tint: string;
  accented: boolean;
}

export const ChronikMilestone: FC<ChronikMilestoneProps> = ({ milestone, tint, accented }) => (
  <Stack
    direction="row"
    data-kk-chronik-milestone
    sx={{ position: 'relative', alignItems: 'flex-start', gap: { xs: 3, md: 4 } }}
  >
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: 16,
        height: 16,
        mt: { xs: 0.5, md: 1 },
        borderRadius: '50%',
        bgcolor: tint,
        border: 3,
        borderColor: 'background.default',
        zIndex: 1,
      }}
    />
    <Card
      sx={{
        flexGrow: 1,
        p: { xs: 2.5, md: 3 },
        ...(accented && { borderColor: 'primary.main', borderWidth: 2 }),
      }}
    >
      <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
        <Typography variant="h3" component="span" sx={{ color: tint, lineHeight: 0.9 }}>
          {milestone.year}
        </Typography>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800 }}>
          {milestone.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {milestone.description}
        </Typography>
        {milestone.isPlaceholder ? (
          <Typography
            variant="caption"
            data-kk-chronik-placeholder
            sx={{
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'warning.main',
              border: 1,
              borderColor: 'warning.main',
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
              px: 1,
              py: 0.25,
            }}
          >
            PLATZHALTER
          </Typography>
        ) : null}
      </Stack>
    </Card>
  </Stack>
);
