import { KkHall } from '@furria/ui/KkHall';
import { KkKeyList } from '@furria/ui/KkKeyList';
import type { FC } from 'react';
import type { Studio, StudioTraining } from '@/features/acts/schemas';
import {
  HALL_BACK,
  HALL_CLOSE,
  HALL_COUNT_IN,
  HALL_COUNT_IN_LABEL,
  HALL_KEYS,
  HALL_KEYS_LABEL,
  HALL_KEYS_TITLE,
  HALL_LABEL,
  HALL_LOOP,
  HALL_LOOP_LABEL,
  HALL_NEXT,
  HALL_TEMPO_LABEL,
  HALL_VIDEO,
  HALL_VIDEO_LABEL,
} from '../hall-copy';
import { useHall } from '../hooks/use-hall';
import { HallCountLive } from './HallCountLive';
import { HallStageLayer } from './HallStageLayer';

interface HallBodyProps {
  studio: Studio;
  training: StudioTraining | null;
  onClose: () => void;
}

export const HallBody: FC<HallBodyProps> = ({ studio, training, onClose }) => {
  const hall = useHall(studio, training);
  const playGlyph = hall.playing ? 'pause' : 'play';
  const videoGlyph = hall.videoOn ? 'video' : 'videoOff';
  const stepless = !hall.canStep;
  const silent = !hall.canPlay;
  const videoless = !hall.hasVideo;

  return (
    <KkHall label={HALL_LABEL}>
      <KkHall.Area area="count">
        <HallCountLive player={hall.playback.player} segments={hall.playback.segments} />
      </KkHall.Area>
      <KkHall.Area area="step">
        <KkHall.Step name={hall.stepName} meta={hall.stepMeta} next={hall.next} />
      </KkHall.Area>
      <HallStageLayer hall={hall} />
      <KkHall.Area area="absent">
        <KkHall.Absent title={hall.absentTitle} people={hall.absences} none={hall.absentNone} />
      </KkHall.Area>
      <KkHall.Area area="keys">
        <KkHall.KeyGroup label={HALL_KEYS_LABEL}>
          <KkHall.Key glyph="back" caption={HALL_BACK} disabled={stepless} onPress={hall.back} />
          <KkHall.Key
            glyph="loop"
            caption={HALL_LOOP}
            label={HALL_LOOP_LABEL}
            pressed={hall.looping}
            disabled={stepless}
            onPress={hall.loop}
          />
          <KkHall.Key
            glyph={playGlyph}
            caption={hall.playCaption}
            strong
            disabled={silent}
            onPress={hall.toggle}
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
            glyph="countIn"
            caption={HALL_COUNT_IN}
            label={HALL_COUNT_IN_LABEL}
            pressed={hall.countingIn}
            onPress={hall.toggleCountIn}
          />
          <KkHall.Key
            glyph={videoGlyph}
            caption={HALL_VIDEO}
            label={HALL_VIDEO_LABEL}
            pressed={hall.videoOn}
            disabled={videoless}
            onPress={hall.toggleVideo}
          />
        </KkHall.KeyGroup>
      </KkHall.Area>
      <KkHall.Corner>
        <KkHall.Close label={HALL_CLOSE} onPress={onClose} />
        <KkHall.Help label={HALL_KEYS_TITLE}>
          <KkKeyList title={HALL_KEYS_TITLE} entries={HALL_KEYS} />
        </KkHall.Help>
      </KkHall.Corner>
    </KkHall>
  );
};
