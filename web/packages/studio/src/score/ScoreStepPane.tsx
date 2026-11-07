import { ScoreLiveFormation } from '@furria/studio/ScoreLiveFormation';
import {
  CLOSE_LABEL,
  EDIT_FROM_HERE,
  FORMATION_TITLE,
  flagTextOf,
  NO_FORMATION,
  NO_VIDEO,
  PRACTISE_FROM_HERE,
  STEP_PANE_LABEL,
  stepStateTextOf,
  VIDEO_TITLE,
} from '@furria/studio/score-copy';
import type { ScoreStepTools } from '@furria/studio/score-step-tools';
import type { ScoreStepView } from '@furria/studio/score-views';
import { KkButton } from '@furria/ui/KkButton';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkStepPane } from '@furria/ui/KkStepPane';
import { KkText } from '@furria/ui/KkText';
import { KkVideo } from '@furria/ui/KkVideo';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface ScoreStepPaneProps {
  view: ScoreStepView;
  tools: ScoreStepTools;
  framed: boolean;
  onClose: (() => void) | null;
}

export const ScoreStepPane: FC<ScoreStepPaneProps> = ({ view, tools, framed, onClose }) => {
  const { practiseFrom, editFrom } = tools;
  const { step } = view;
  const ready = step.movement && step.video !== null;
  const state = ready ? 'done' : 'open';
  const stateLabel = stepStateTextOf(step.movement, step.video !== null);
  const close =
    onClose === null ? undefined : (
      <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
    );
  const videoLabel = view.videoName ?? VIDEO_TITLE;
  const practiseVariant = editFrom === null ? 'contained' : 'outlined';
  const formation =
    view.dots.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {NO_FORMATION}
      </KkText>
    ) : (
      <ScoreLiveFormation scene={tools.scene} player={tools.player} view={view} />
    );
  const videoCaption =
    view.videoName === null ? null : (
      <KkText variant="caption" tone="secondary">
        {view.videoName}
      </KkText>
    );
  const video =
    view.videoSource === null || view.videoPoster === null || step.video === null ? (
      <KkText variant="body2" tone="secondary">
        {NO_VIDEO}
      </KkText>
    ) : (
      <Stack sx={{ gap: 0.5 }}>
        <KkVideo label={videoLabel} fit="card">
          <KkVideo.Clip
            label={videoLabel}
            source={view.videoSource}
            poster={view.videoPoster}
            offsetSeconds={step.video.offsetSeconds}
          />
        </KkVideo>
        {videoCaption}
      </Stack>
    );
  const flag = step.flag === null ? null : <KkNote>{flagTextOf(step.flag)}</KkNote>;
  const practise = (): void => {
    practiseFrom?.(step.stepId);
  };
  const edit = (): void => {
    editFrom?.(step.stepId);
  };
  const practiseButton =
    practiseFrom === null ? null : (
      <KkButton variant={practiseVariant} fullWidth onClick={practise}>
        {PRACTISE_FROM_HERE}
      </KkButton>
    );
  const editButton =
    editFrom === null ? null : (
      <KkButton variant="contained" fullWidth onClick={edit}>
        {EDIT_FROM_HERE}
      </KkButton>
    );
  const foot =
    practiseButton === null && editButton === null ? null : (
      <KkStepPane.Foot>
        <Stack direction="row" sx={{ gap: 1 }}>
          {practiseButton}
          {editButton}
        </Stack>
      </KkStepPane.Foot>
    );

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
        <KkPanelSection title={VIDEO_TITLE}>{video}</KkPanelSection>
      </KkStepPane.Body>
      {foot}
    </KkStepPane>
  );
};
