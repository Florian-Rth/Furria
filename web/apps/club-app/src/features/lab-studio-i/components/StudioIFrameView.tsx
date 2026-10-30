import { KkStudioIFrame } from '@furria/ui/KkStudioIFrame';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioIClipView } from '../hooks/use-studio-i-clip';
import type { StudioIEdit } from '../hooks/use-studio-i-edit';
import type { StudioIOverviewView } from '../hooks/use-studio-i-overview';
import type { StudioIStageView as StageModel } from '../hooks/use-studio-i-stage';
import type { StudioISwipe } from '../hooks/use-studio-i-swipe';
import { STUDIO_I_FRAME_LABEL, STUDIO_I_SHOW_STAGE, STUDIO_I_SHOW_VIDEO } from '../studio-i-copy';
import { StudioIOverviewView as OverviewView } from './StudioIOverviewView';
import { StudioIStageView } from './StudioIStageView';
import { StudioIVideoScreen } from './StudioIVideoScreen';

interface StudioIFrameViewProps {
  edit: StudioIEdit;
  playback: StudioPlayback;
  stage: StageModel;
  clip: StudioIClipView;
  overview: StudioIOverviewView;
  swipe: StudioISwipe;
}

export const StudioIFrameView: FC<StudioIFrameViewProps> = ({
  edit,
  playback,
  stage,
  clip,
  overview,
  swipe,
}) => {
  if (edit.span === null) {
    return <OverviewView overview={overview} full={!edit.wide} />;
  }

  const stageView = (
    <StudioIStageView stage={stage} player={playback.player} playing={playback.state.playing} />
  );

  if (edit.wide || clip.clip === null) {
    return (
      <KkStudioIFrame label={STUDIO_I_FRAME_LABEL} surface={swipe}>
        <KkStudioIFrame.Layer role="main" swapLabel={STUDIO_I_SHOW_STAGE} onSwap={edit.toggleSwap}>
          {stageView}
        </KkStudioIFrame.Layer>
      </KkStudioIFrame>
    );
  }

  const videoRole = edit.swapped ? 'main' : 'inset';
  const stageRole = edit.swapped ? 'inset' : 'main';

  return (
    <KkStudioIFrame label={STUDIO_I_FRAME_LABEL} surface={swipe}>
      <KkStudioIFrame.Layer
        role={stageRole}
        swapLabel={STUDIO_I_SHOW_STAGE}
        onSwap={edit.toggleSwap}
      >
        {stageView}
      </KkStudioIFrame.Layer>
      <KkStudioIFrame.Layer
        role={videoRole}
        swapLabel={STUDIO_I_SHOW_VIDEO}
        onSwap={edit.toggleSwap}
      >
        <StudioIVideoScreen clip={clip} badged={edit.swapped} />
      </KkStudioIFrame.Layer>
    </KkStudioIFrame>
  );
};
