import { KkCard } from '@furria/ui/KkCard';
import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Milestone } from '@/features/club/chronicle-content';
import { ChronicleMilestoneQuote } from './ChronicleMilestoneQuote';

interface ChronicleMilestoneProps {
  milestone: Milestone;
  tint: string;
  accented: boolean;
}

export const ChronicleMilestone: FC<ChronicleMilestoneProps> = ({ milestone, tint, accented }) => {
  const quote =
    milestone.quote === null ? null : <ChronicleMilestoneQuote text={milestone.quote} />;

  return (
    <Stack
      direction="row"
      data-kk-chronicle-milestone
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
      <KkCard
        sx={{
          flexGrow: 1,
          ...(accented && { borderColor: 'primary.main', borderWidth: kkTokens.line.section }),
        }}
      >
        <KkCard.Body>
          <Typography variant="h2" component="span" sx={{ color: 'primary.main', lineHeight: 0.9 }}>
            {milestone.dateLabel}
          </Typography>
          <KkCard.Title>{milestone.title}</KkCard.Title>
          <KkCard.Text>
            {milestone.description} {quote}
          </KkCard.Text>
        </KkCard.Body>
      </KkCard>
    </Stack>
  );
};
