import { KkCard } from '@furria/ui/KkCard';
import type { SxProps, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { SeasonPhase, SeasonStep as SeasonStepData } from '@/features/club/season-content';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.06);
  }
`;

const replayedSx = {
  animation: `${pulse} 700ms ease-in-out 350ms`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const;

const phaseCardSx = {
  opening: { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' },
  official: {},
  unofficial: { bgcolor: 'transparent', borderStyle: 'dashed' },
} satisfies Record<SeasonPhase, SxProps<Theme>>;

interface SeasonStepProps {
  step: SeasonStepData;
  replayCount: number;
  trailing: ReactNode;
}

export const SeasonStep: FC<SeasonStepProps> = ({ step, replayCount, trailing }) => {
  const isOpening = step.phase === 'opening';
  const replaySx = replayCount > 0 ? replayedSx : {};
  const cardSx: SxProps<Theme> = { ...phaseCardSx[step.phase], ...replaySx };

  return (
    <KkCard key={replayCount} sx={cardSx}>
      <KkCard.Body>
        <Typography
          variant="h2"
          component="span"
          sx={{ color: isOpening ? 'inherit' : 'primary.main', lineHeight: 1 }}
        >
          {step.tag}
        </Typography>
        <KkCard.Title>{step.title}</KkCard.Title>
        <KkCard.Text tone={isOpening ? 'onAccent' : 'muted'}>
          {step.description} {trailing}
        </KkCard.Text>
      </KkCard.Body>
    </KkCard>
  );
};
