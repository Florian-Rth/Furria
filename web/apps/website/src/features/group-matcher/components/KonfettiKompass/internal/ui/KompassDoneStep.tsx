import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kompassLabels } from '@/features/group-matcher/kompass-content';
import { KompassStepBody } from '../layout/KompassStepBody';
import { KompassStepFooter } from '../layout/KompassStepFooter';
import { KompassStepReveal } from './KompassStepReveal';

interface KompassDoneStepProps {
  summary: string;
  onBack: () => void;
  onRestart: () => void;
}

export const KompassDoneStep: FC<KompassDoneStepProps> = ({ summary, onBack, onRestart }) => (
  <>
    <KompassStepReveal>
      <KompassStepBody>
        <Typography variant="h3" component="p">
          {kompassLabels.doneTitle}
        </Typography>
        <Stack sx={{ gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {summary}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {kompassLabels.doneHint}
          </Typography>
        </Stack>
      </KompassStepBody>
    </KompassStepReveal>
    <KompassStepFooter sx={{ mt: 'auto' }}>
      <Button variant="text" onClick={onBack} sx={{ color: 'text.secondary' }}>
        {kompassLabels.back}
      </Button>
      <Button variant="outlined" onClick={onRestart}>
        {kompassLabels.restart}
      </Button>
    </KompassStepFooter>
  </>
);
