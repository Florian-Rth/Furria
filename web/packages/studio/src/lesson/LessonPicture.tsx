import { LessonCueLive } from '@furria/studio/LessonCueLive';
import { LESSON_PICTURE_LABEL } from '@furria/studio/lesson-copy';
import { PracticeStageLayer } from '@furria/studio/PracticeStageLayer';
import {
  noVideoEyebrowOf,
  PRACTICE_MIRRORED,
  PRACTICE_VIDEO_TITLE,
} from '@furria/studio/practice-copy';
import type { Lesson } from '@furria/studio/use-lesson';
import { KkLesson } from '@furria/ui/KkLesson';
import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';

const VIDEO_ASPECT = 16 / 9;
const FRONT_ROOM_SHARE = 1.14;

interface LessonPictureProps {
  lesson: Lesson;
}

export const LessonPicture: FC<LessonPictureProps> = ({ lesson }) => {
  const { picture } = lesson;
  const { studio, playback, video, practice } = lesson.screen;
  const { plan } = picture;
  const stageAspect = playback.stage.widthMetres / (playback.stage.depthMetres * FRONT_ROOM_SHARE);
  const insetAspect = plan.video === 'inset' ? VIDEO_ASPECT : stageAspect;
  const swap = plan.swappable ? (
    <KkLesson.Swap aspect={insetAspect} label={picture.swapLabel} onSwap={picture.swap} />
  ) : null;
  const mirror =
    plan.video === 'main' ? (
      <KkPracticeScreen.Mirror
        text={PRACTICE_MIRRORED}
        mirrored={video.mirrored}
        onToggle={video.toggleMirror}
      />
    ) : null;
  const take =
    plan.video === 'main' && video.take !== null ? (
      <KkPracticeScreen.Take
        text={video.take.text}
        label={video.take.label}
        onNext={video.take.next}
      />
    ) : null;
  const noVideo =
    plan.video === 'off' ? <KkLesson.Tag text={noVideoEyebrowOf(practice.partName)} /> : null;

  return (
    <KkLesson.Picture label={LESSON_PICTURE_LABEL} paired={plan.swappable}>
      <KkLesson.Layer place={plan.video} aspect={VIDEO_ASPECT} tone="ink">
        <KkLesson.Video
          label={PRACTICE_VIDEO_TITLE}
          source={video.source}
          videoRef={video.ref}
          mirrored={video.mirrored}
        />
      </KkLesson.Layer>
      <KkLesson.Layer place={plan.stage} aspect={stageAspect} tone="paper">
        <PracticeStageLayer studio={studio} playback={playback} />
      </KkLesson.Layer>
      {swap}
      <KkLesson.Corner side="start">
        <LessonCueLive
          player={playback.player}
          ownPath={lesson.ownPath}
          marks={playback.countMarks}
          loop={practice.loop}
        />
        {noVideo}
      </KkLesson.Corner>
      <KkLesson.Corner side="end">
        {take}
        {mirror}
      </KkLesson.Corner>
    </KkLesson.Picture>
  );
};
