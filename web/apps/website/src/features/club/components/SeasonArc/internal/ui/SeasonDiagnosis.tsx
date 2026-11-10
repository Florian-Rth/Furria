import { KkButton } from '@furria/ui/KkButton';
import { KkCard } from '@furria/ui/KkCard';
import { KkConfettiBurst } from '@furria/ui/KkConfettiBurst';
import { KkDiagonalStamp } from '@furria/ui/KkDiagonalStamp';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { seasonDiagnosis } from '@/features/club/season-content';

const arrive = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface SeasonDiagnosisProps {
  fireKey: number;
  onAnotherRound: () => void;
}

export const SeasonDiagnosis: FC<SeasonDiagnosisProps> = ({ fireKey, onAnotherRound }) => (
  <Box
    data-kk-season-diagnosis
    role="status"
    sx={{
      position: 'relative',
      maxWidth: kkTokens.measure.lead,
      animation: `${arrive} 400ms ease-out`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }}
  >
    <KkDiagonalStamp label={seasonDiagnosis.stamp} fireKey={fireKey} />
    <KkCard sx={{ borderColor: 'primary.main', borderWidth: kkTokens.line.section }}>
      <KkCard.Body>
        <KkEyebrow>{seasonDiagnosis.eyebrow}</KkEyebrow>
        <Typography variant="h3" component="p" sx={{ color: 'primary.main' }}>
          {seasonDiagnosis.title}
        </Typography>
        <KkCard.Text>{seasonDiagnosis.text}</KkCard.Text>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          {seasonDiagnosis.sideEffects}
        </Typography>
        <Stack direction="row" sx={{ pt: 1, gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button component={RouterLink} to="/join" variant="contained" color="primary">
            {seasonDiagnosis.therapyLabel}
          </Button>
          <KkButton variant="outlined" onClick={onAnotherRound}>
            {seasonDiagnosis.anotherRoundLabel}
          </KkButton>
        </Stack>
      </KkCard.Body>
    </KkCard>
    <KkConfettiBurst fireKey={fireKey} count={24} />
  </Box>
);
