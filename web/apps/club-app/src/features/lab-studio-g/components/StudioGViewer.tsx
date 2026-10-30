import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import { KkStudioGStage } from '@furria/ui/KkStudioGStage';
import { KkStudioGViewer } from '@furria/ui/KkStudioGViewer';
import type { FC } from 'react';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { useStudioGStage } from '../hooks/use-studio-g-stage';
import { SIGHT_OPTIONS, useStudioGViewer } from '../hooks/use-studio-g-viewer';
import {
  NO_VIDEO_EYEBROW,
  NO_VIDEO_HERE,
  STAGE_FROM_AUDIENCE,
  STAGE_FROM_DANCERS,
  STAGE_FRONT,
  VIEWER_LABEL,
  VIEWER_SHOW_STAGE,
  VIEWER_SHOW_VIDEO,
  VIEWER_SIGHT,
  VIEWER_STAGE,
  VIEWER_VIDEO,
  viewerCaptionOf,
} from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { StudioGStageLive } from './StudioGStageLive';

interface StudioGViewerProps {
  desk: StudioGDesk;
  practice: Practice;
  video: PracticeVideo;
}

export const StudioGViewer: FC<StudioGViewerProps> = ({ desk, practice, video }) => {
  const viewer = useStudioGViewer();
  const stage = useStudioGStage(desk, viewer.viewpoint);
  const { playback, studio } = desk;
  const filmed = video.hero === 'video';
  const stagePlacement = viewer.swapped ? 'inset' : 'main';
  const videoPlacement = viewer.swapped ? 'main' : 'inset';
  const stageLabel = viewer.viewpoint === 'audience' ? STAGE_FROM_AUDIENCE : STAGE_FROM_DANCERS;
  const mirrored = viewer.viewpoint === 'dancers';
  const caption = viewerCaptionOf(practice.stepName, practice.partName);
  const videoSwap = viewer.swapped ? null : (
    <KkStudioGViewer.Swap label={VIEWER_SHOW_VIDEO} onSwap={viewer.swap} />
  );
  const stageSwap = viewer.swapped ? (
    <KkStudioGViewer.Swap label={VIEWER_SHOW_STAGE} onSwap={viewer.swap} />
  ) : null;

  return (
    <KkStudioGViewer label={VIEWER_LABEL}>
      <KkStudioGViewer.Bar>
        <KkStudioGViewer.Sight
          label={VIEWER_SIGHT}
          options={SIGHT_OPTIONS}
          current={viewer.viewpoint}
          onPick={viewer.pickSight}
        />
        <KkStudioGViewer.Caption text={caption} />
      </KkStudioGViewer.Bar>
      <KkStudioGViewer.Pane content="video" placement={videoPlacement} label={VIEWER_VIDEO}>
        <KkPracticeScreen label={VIEWER_VIDEO} fit="fill">
          <KkPracticeScreen.Layer shown={filmed} tone="ink">
            <KkPracticeScreen.Video
              source={video.source}
              videoRef={video.ref}
              mirrored={mirrored}
            />
          </KkPracticeScreen.Layer>
          <KkPracticeScreen.Layer shown={!filmed} tone="clear">
            <KkPracticeScreen.Note eyebrow={NO_VIDEO_EYEBROW} text={NO_VIDEO_HERE} />
          </KkPracticeScreen.Layer>
        </KkPracticeScreen>
        {videoSwap}
      </KkStudioGViewer.Pane>
      <KkStudioGViewer.Pane content="stage" placement={stagePlacement} label={VIEWER_STAGE}>
        <KkStudioGStage
          label={stageLabel}
          frontLabel={STAGE_FRONT}
          widthMetres={playback.stage.widthMetres}
          depthMetres={playback.stage.depthMetres}
          artworkSvg={playback.stage.artworkSvg}
          viewpoint={viewer.viewpoint}
          gestures={stage.gestures}
        >
          <StudioGStageLive
            playback={playback}
            spots={studio.spots}
            viewpoint={viewer.viewpoint}
            selectedIds={stage.selectedIds}
            dragging={stage.dragging}
          />
          <KkStudioGStage.Marquee box={stage.box} />
        </KkStudioGStage>
        {stageSwap}
      </KkStudioGViewer.Pane>
    </KkStudioGViewer>
  );
};
