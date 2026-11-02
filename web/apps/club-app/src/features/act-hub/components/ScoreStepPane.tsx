import { KkButton } from '@furria/ui/KkButton';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkScoreVideo } from '@furria/ui/KkScoreVideo';
import { KkStepPane } from '@furria/ui/KkStepPane';
import { KkText } from '@furria/ui/KkText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActHub, ScoreStepView } from '../hooks/use-act-hub';
import {
  CLOSE_LABEL,
  DESCRIPTION_TITLE,
  EDIT_FROM_HERE,
  FORMATION_TITLE,
  flagTextOf,
  NO_DESCRIPTION,
  NO_FORMATION,
  NO_VIDEO,
  PRACTISE_FROM_HERE,
  STEP_PANE_LABEL,
  stepStateTextOf,
  VIDEO_TITLE,
} from '../score-copy';
import { ScoreLiveFormation } from './ScoreLiveFormation';

const HALF = 6;
const FULL = 12;

interface ScoreStepPaneProps {
  score: ActHub;
  view: ScoreStepView;
  framed: boolean;
  onClose: (() => void) | null;
}

export const ScoreStepPane: FC<ScoreStepPaneProps> = ({ score, view, framed, onClose }) => {
  const { step } = view;
  const ready = step.movement && step.video !== null;
  const state = ready ? 'done' : 'open';
  const stateLabel = stepStateTextOf(step.movement, step.video !== null);
  const close =
    onClose === null ? undefined : (
      <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
    );
  const practise = (): void => {
    score.route.practiseFrom(step.stepId);
  };
  const edit = (): void => {
    score.route.editFrom(step.stepId);
  };
  const formation =
    view.dots.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {NO_FORMATION}
      </KkText>
    ) : (
      <ScoreLiveFormation score={score} view={view} />
    );
  const video =
    view.videoSource === null || view.videoPoster === null || step.video === null ? (
      <KkText variant="body2" tone="secondary">
        {NO_VIDEO}
      </KkText>
    ) : (
      <Stack sx={{ gap: 0.5 }}>
        <KkScoreVideo
          label={view.videoName ?? VIDEO_TITLE}
          source={view.videoSource}
          poster={view.videoPoster}
          offsetSeconds={step.video.offsetSeconds}
        />
        <KkText variant="caption" tone="secondary">
          {view.videoName}
        </KkText>
      </Stack>
    );
  const flag = step.flag === null ? null : <KkNote>{flagTextOf(step.flag)}</KkNote>;
  const description = step.description ?? NO_DESCRIPTION;
  const descriptionTone = step.description === null ? 'secondary' : 'primary';
  const practiseButton = score.canPlay ? (
    <KkButton variant={score.canEditStudio ? 'outlined' : 'contained'} fullWidth onClick={practise}>
      {PRACTISE_FROM_HERE}
    </KkButton>
  ) : null;
  const editButton = score.canEditStudio ? (
    <KkButton variant="contained" fullWidth onClick={edit}>
      {EDIT_FROM_HERE}
    </KkButton>
  ) : null;
  const foot =
    practiseButton === null && editButton === null ? null : (
      <KkStepPane.Foot>
        <Stack direction="row" sx={{ gap: 1 }}>
          {practiseButton}
          {editButton}
        </Stack>
      </KkStepPane.Foot>
    );
  const split = score.wide ? HALF : FULL;

  return (
    <KkStepPane label={STEP_PANE_LABEL} framed={framed}>
      <KkStepPane.Head
        icon="stage"
        title={view.title}
        context={view.context}
        state={state}
        stateLabel={stateLabel}
        actions={close}
      />
      <KkStepPane.Body>
        {flag}
        <KkPanelSection title={FORMATION_TITLE}>{formation}</KkPanelSection>
        <Grid container spacing={2}>
          <Grid size={{ xs: FULL, md: split }}>
            <KkPanelSection title={DESCRIPTION_TITLE}>
              <KkText variant="body2" tone={descriptionTone}>
                {description}
              </KkText>
            </KkPanelSection>
          </Grid>
          <Grid size={{ xs: FULL, md: split }}>
            <KkPanelSection title={VIDEO_TITLE}>{video}</KkPanelSection>
          </Grid>
        </Grid>
      </KkStepPane.Body>
      {foot}
    </KkStepPane>
  );
};
