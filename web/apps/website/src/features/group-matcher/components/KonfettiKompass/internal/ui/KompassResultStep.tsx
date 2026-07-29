import Button from '@mui/material/Button';
import type { FC } from 'react';
import { kompassLabels, kompassResultLabels } from '@/features/group-matcher/kompass-content';
import { KompassStepBody } from '../layout/KompassStepBody';
import { KompassStepFooter } from '../layout/KompassStepFooter';
import type { KompassResultView } from '../logic/kompass-result';
import { KompassResultBody } from './KompassResultBody';
import { KompassStepReveal } from './KompassStepReveal';

interface KompassResultStepProps {
  view: KompassResultView;
  summary: string;
  onChangeAnswers: () => void;
  onRestart: () => void;
}

export const KompassResultStep: FC<KompassResultStepProps> = ({
  view,
  summary,
  onChangeAnswers,
  onRestart,
}) => (
  <>
    <KompassStepReveal>
      <KompassStepBody>
        <KompassResultBody view={view} summary={summary} />
      </KompassStepBody>
    </KompassStepReveal>
    <KompassStepFooter sx={{ mt: 'auto', pt: { xs: 2, md: 3 } }}>
      <Button variant="text" onClick={onChangeAnswers} sx={{ color: 'text.secondary' }}>
        {kompassResultLabels.changeAnswers}
      </Button>
      <Button variant="outlined" onClick={onRestart}>
        {kompassLabels.restart}
      </Button>
    </KompassStepFooter>
  </>
);
