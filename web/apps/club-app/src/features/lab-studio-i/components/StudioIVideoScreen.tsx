import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import { KkStudioIClip } from '@furria/ui/KkStudioIClip';
import type { FC } from 'react';
import type { StudioIClipView } from '../hooks/use-studio-i-clip';
import { STUDIO_I_VIDEO_TITLE } from '../studio-i-copy';

interface StudioIVideoScreenProps {
  clip: StudioIClipView;
  badged: boolean;
}

export const StudioIVideoScreen: FC<StudioIVideoScreenProps> = ({ clip, badged }) => {
  const filmed = clip.source !== null;
  const badge =
    badged && filmed ? (
      <KkStudioIClip.Badge
        text={clip.badge}
        label={clip.badgeLabel}
        selected={clip.selected}
        onPress={clip.select}
      />
    ) : null;

  return (
    <KkPracticeScreen label={STUDIO_I_VIDEO_TITLE} fit="fill">
      <KkPracticeScreen.Layer shown={filmed} tone="ink">
        <KkPracticeScreen.Video source={clip.source} videoRef={clip.ref} mirrored />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={!filmed} tone="paper">
        <KkPracticeScreen.Note eyebrow={clip.emptyEyebrow} text={clip.emptyText} />
      </KkPracticeScreen.Layer>
      {badge}
    </KkPracticeScreen>
  );
};
