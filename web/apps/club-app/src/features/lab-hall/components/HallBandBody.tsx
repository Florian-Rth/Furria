import { KkHall } from '@furria/ui/KkHall';
import type { FC } from 'react';
import {
  HALL_BACK,
  HALL_CLOSE,
  HALL_END,
  HALL_LABEL,
  HALL_LOOP,
  HALL_LOOP_LABEL,
  HALL_NEXT,
  HALL_PAD_LABEL,
  HALL_TEMPO_LABEL,
  HALL_VIDEO,
  HALL_VIDEO_LABEL,
} from '../hall-copy';
import type { Hall } from '../hooks/use-hall';
import { HallBandLive } from './HallBandLive';
import { HallStageLayer } from './HallStageLayer';

interface HallBandBodyProps {
  hall: Hall;
}

export const HallBandBody: FC<HallBandBodyProps> = ({ hall }) => {
  const videoGlyph = hall.videoOn ? 'video' : 'videoOff';
  const stepless = !hall.canStep;
  const silent = !hall.canPlay;
  const videoless = !hall.hasVideo;

  return (
    <KkHall label={HALL_LABEL} layout="band">
      <KkHall.Area area="band">
        <HallBandLive player={hall.playback.player} segments={hall.playback.segments} />
      </KkHall.Area>
      <KkHall.Area area="step">
        <KkHall.Pad
          label={HALL_PAD_LABEL}
          playing={hall.playing}
          disabled={silent}
          onPress={hall.toggle}
        >
          <KkHall.Step name={hall.stepName} meta={hall.stepMeta} next={hall.next} />
        </KkHall.Pad>
      </KkHall.Area>
      <HallStageLayer hall={hall} />
      <KkHall.Area area="absent">
        <KkHall.Absent title={hall.absentTitle} people={hall.absences} none={hall.absentNone} />
      </KkHall.Area>
      <KkHall.Area area="keys">
        <KkHall.KeyGroup flow="row">
          <KkHall.Key glyph="back" caption={HALL_BACK} disabled={stepless} onPress={hall.back} />
          <KkHall.Key
            glyph="loop"
            caption={HALL_LOOP}
            label={HALL_LOOP_LABEL}
            pressed={hall.looping}
            disabled={stepless}
            onPress={hall.loop}
          />
          <KkHall.Key glyph="next" caption={HALL_NEXT} disabled={stepless} onPress={hall.forward} />
          <KkHall.Key
            glyph="tempo"
            caption={hall.tempoCaption}
            label={HALL_TEMPO_LABEL}
            pressed={hall.slowed}
            disabled={silent}
            onPress={hall.tempo}
          />
          <KkHall.Key
            glyph={videoGlyph}
            caption={HALL_VIDEO}
            label={HALL_VIDEO_LABEL}
            pressed={hall.videoOn}
            disabled={videoless}
            onPress={hall.toggleVideo}
          />
          <KkHall.Key glyph="close" caption={HALL_END} label={HALL_CLOSE} onPress={hall.close} />
        </KkHall.KeyGroup>
      </KkHall.Area>
    </KkHall>
  );
};
