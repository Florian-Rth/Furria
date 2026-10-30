import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC, ReactNode } from 'react';
import type { FinalGridDesk } from '../hooks/use-final-desk';
import type { SongDeskNudge } from '../hooks/use-song-desk';
import {
  STUDIO_FINAL_GRID_DESK,
  STUDIO_NUDGE_BACK,
  STUDIO_NUDGE_ON,
  STUDIO_SONG_ONE,
  STUDIO_SONG_ONE_EARLIER,
  STUDIO_SONG_ONE_HERE,
  STUDIO_SONG_ONE_LATER,
  STUDIO_SONG_TEMPO,
} from '../studio-copy';

interface ActStudioFinalGridBodyProps {
  desk: FinalGridDesk;
}

export const ActStudioFinalGridBody: FC<ActStudioFinalGridBodyProps> = ({ desk }) => {
  const nudgeOf = (nudge: SongDeskNudge): ReactNode => (
    <KkStudioDesk.Nudge
      key={nudge.key}
      text={nudge.text}
      label={nudge.label}
      onPress={nudge.press}
    />
  );
  const slower = desk.slower.map(nudgeOf);
  const faster = desk.faster.map(nudgeOf);
  const oneEarlier = (): void => {
    desk.nudgeOne(-1);
  };
  const oneLater = (): void => {
    desk.nudgeOne(1);
  };

  return (
    <KkStudioDesk label={STUDIO_FINAL_GRID_DESK}>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_SONG_TEMPO} />
        <KkStudioDesk.Controls>
          {slower}
          <KkStudioDesk.Value text={desk.tempoText} />
          {faster}
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_SONG_ONE} />
        <KkStudioDesk.Controls>
          <KkStudioDesk.Nudge
            text={STUDIO_NUDGE_BACK}
            label={STUDIO_SONG_ONE_EARLIER}
            disabled={desk.beatLocked}
            onPress={oneEarlier}
          />
          <KkStudioDesk.Value text={desk.beatText} />
          <KkStudioDesk.Nudge
            text={STUDIO_NUDGE_ON}
            label={STUDIO_SONG_ONE_LATER}
            disabled={desk.beatLocked}
            onPress={oneLater}
          />
          <KkButton variant="outlined" size="small" onClick={desk.placeOne}>
            {STUDIO_SONG_ONE_HERE}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
    </KkStudioDesk>
  );
};
