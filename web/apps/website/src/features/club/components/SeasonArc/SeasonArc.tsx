import { KkLead } from '@furria/ui/KkLead';
import { KkSection } from '@furria/ui/KkSection';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { SEASON_STEPS, seasonChapter, seasonIntro } from '@/features/club/season-content';
import { SeasonRow } from './internal/layout/SeasonRow';
import { useSeasonLoop } from './internal/logic/use-season-loop';
import { SeasonDiagnosis } from './internal/ui/SeasonDiagnosis';
import { SeasonLoopButton } from './internal/ui/SeasonLoopButton';
import { SeasonStep } from './internal/ui/SeasonStep';

export const SeasonArc: FC = () => {
  const { openingRef, replayCount, diagnosisKey, loopBack } = useSeasonLoop();

  const steps = SEASON_STEPS.map((step) => {
    const isOpening = step.phase === 'opening';
    const loopButton = step.loopsBack ? <SeasonLoopButton onLoopBack={loopBack} /> : null;

    return (
      <Grid
        key={step.tag}
        ref={isOpening ? openingRef : undefined}
        size={{ xs: 12, sm: 6, md: 'grow' }}
      >
        <SeasonStep step={step} replayCount={isOpening ? replayCount : 0} trailing={loopButton} />
      </Grid>
    );
  });

  const diagnosis =
    diagnosisKey === 0 ? null : (
      <SeasonDiagnosis fireKey={diagnosisKey} onAnotherRound={loopBack} />
    );

  return (
    <KkSection>
      <KkSection.Header {...seasonChapter} />
      <KkLead>{seasonIntro}</KkLead>
      <SeasonRow>{steps}</SeasonRow>
      {diagnosis}
    </KkSection>
  );
};
