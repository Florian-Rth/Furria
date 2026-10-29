import { KkStudioCView } from '@furria/ui/KkStudioCView';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useMomentVideo } from '../hooks/use-moment-video';
import type { StudioCDesk } from '../hooks/use-studio-c-desk';
import {
  STUDIO_C_INSET_MIRRORED,
  STUDIO_C_INSET_PLAIN,
  STUDIO_C_INSET_STAGE,
  STUDIO_C_SWAP_TO_STAGE,
  STUDIO_C_SWAP_TO_VIDEO,
  STUDIO_C_VIEW_LABEL,
} from '../studio-c-copy';
import { StudioCStageDots } from './StudioCStageDots';
import { StudioCVideoLayer } from './StudioCVideoLayer';

const PORTRAIT_INSET = 4 / 5;

interface StudioCViewProps {
  desk: StudioCDesk;
  studio: Studio;
}

export const StudioCView: FC<StudioCViewProps> = ({ desk, studio }) => {
  const isMobile = useIsMobile();
  const momentVideo = useMomentVideo(desk.playback, studio);
  const { playback, mirrored, videoFirst, swapView } = desk;
  const { stage, player } = playback;
  const video = isMobile ? momentVideo : null;
  const videoBig = video !== null && videoFirst;
  const stageRatio = stage.widthMetres / stage.depthMetres;
  const stageView = <StudioCStageDots playback={playback} studio={studio} />;
  const videoCaption = mirrored ? STUDIO_C_INSET_MIRRORED : STUDIO_C_INSET_PLAIN;

  const videoFit = videoBig ? 'contain' : 'cover';
  const videoView =
    video === null ? null : (
      <StudioCVideoLayer
        key={video.videoId}
        player={player}
        video={video}
        mirrored={mirrored}
        fit={videoFit}
      />
    );
  const main = videoBig ? videoView : stageView;
  const insetView = videoBig ? stageView : videoView;
  const insetRatio = videoBig ? stageRatio : PORTRAIT_INSET;
  const insetCaption = videoBig ? STUDIO_C_INSET_STAGE : videoCaption;
  const swapLabel = videoBig ? STUDIO_C_SWAP_TO_STAGE : STUDIO_C_SWAP_TO_VIDEO;
  const inset =
    video === null ? null : (
      <KkStudioCView.Inset
        ratio={insetRatio}
        caption={insetCaption}
        swapLabel={swapLabel}
        onSwap={swapView}
      >
        {insetView}
      </KkStudioCView.Inset>
    );

  return (
    <KkStudioCView label={STUDIO_C_VIEW_LABEL}>
      <KkStudioCView.Main ratio={stageRatio}>{main}</KkStudioCView.Main>
      {inset}
    </KkStudioCView>
  );
};
