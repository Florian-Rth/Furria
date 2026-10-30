import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import { KkWayPip } from '@furria/ui/KkWayPip';
import type { FC } from 'react';
import { PRACTICE_NO_VIDEO_NOTE } from '@/features/act-practice/practice-copy';
import type { WayScreen } from '../hooks/use-way-screen';
import {
  WAY_MIRROR_OFF_LABEL,
  WAY_MIRROR_ON_LABEL,
  WAY_VIDEO_LARGE_LABEL,
  WAY_VIDEO_SMALL_LABEL,
  wayNoVideoEyebrowOf,
} from '../way-copy';

interface WayPipProps {
  screen: WayScreen;
  docked: boolean;
}

export const WayPip: FC<WayPipProps> = ({ screen, docked }) => {
  const { video, pip, practice, playback } = screen;
  const stageAspect = playback.stage.depthMetres / playback.stage.widthMetres;
  const label = pip.large ? WAY_VIDEO_LARGE_LABEL : WAY_VIDEO_SMALL_LABEL;
  const mirrorLabel = video.mirrored ? WAY_MIRROR_ON_LABEL : WAY_MIRROR_OFF_LABEL;
  const filmed = video.source !== null && video.hero === 'video';
  const plate = filmed ? null : (
    <KkWayPip.Plate
      eyebrow={wayNoVideoEyebrowOf(practice.partName)}
      text={PRACTICE_NO_VIDEO_NOTE}
    />
  );
  const take =
    video.take === null ? null : (
      <KkWayPip.Key
        glyph="take"
        text={video.take.text}
        label={video.take.label}
        pressed={false}
        onPress={video.take.next}
      />
    );
  const mirror = filmed ? (
    <KkWayPip.Key
      glyph="mirror"
      text={null}
      label={mirrorLabel}
      pressed={video.mirrored}
      onPress={video.toggleMirror}
    />
  ) : null;

  const keys = (
    <>
      {take}
      {mirror}
    </>
  );

  return (
    <KkWayPip
      label={label}
      corner={pip.corner}
      large={pip.large}
      docked={docked}
      stageAspect={stageAspect}
      onCorner={pip.setCorner}
      onToggleSize={pip.toggleLarge}
      keys={keys}
    >
      <KkPracticeScreen.Video
        source={video.source}
        videoRef={video.ref}
        mirrored={video.mirrored}
      />
      {plate}
    </KkWayPip>
  );
};
