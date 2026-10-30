import { KkStudioIClip } from '@furria/ui/KkStudioIClip';
import { KkStudioIOverview } from '@furria/ui/KkStudioIOverview';
import type { FC } from 'react';
import type { StudioIClipView } from '../hooks/use-studio-i-clip';
import type { StudioIDetailView as DetailModel } from '../hooks/use-studio-i-detail';
import type { StudioIOverviewView } from '../hooks/use-studio-i-overview';
import { STUDIO_I_VIDEO_TITLE } from '../studio-i-copy';
import { StudioIDetailPane } from './StudioIDetailPane';
import { StudioIOverviewExtras } from './StudioIOverviewExtras';
import { StudioIVideoScreen } from './StudioIVideoScreen';

interface StudioISideViewProps {
  onStep: boolean;
  paned: boolean;
  clip: StudioIClipView;
  detail: DetailModel;
  overview: StudioIOverviewView;
}

export const StudioISideView: FC<StudioISideViewProps> = ({
  onStep,
  paned,
  clip,
  detail,
  overview,
}) => {
  if (!onStep) {
    return (
      <KkStudioIOverview label={overview.stageTitle}>
        <StudioIOverviewExtras overview={overview} />
      </KkStudioIOverview>
    );
  }

  const pane = paned ? <StudioIDetailPane detail={detail} /> : null;

  return (
    <>
      <KkStudioIClip label={STUDIO_I_VIDEO_TITLE}>
        <KkStudioIClip.Screen>
          <StudioIVideoScreen clip={clip} badged />
        </KkStudioIClip.Screen>
        <KkStudioIClip.Caption name={clip.name} meta={clip.meta} />
      </KkStudioIClip>
      {pane}
    </>
  );
};
