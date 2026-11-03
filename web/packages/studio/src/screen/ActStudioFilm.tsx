import {
  STUDIO_FILM,
  STUDIO_FILM_EARLIER,
  STUDIO_FILM_EDIT,
  STUDIO_FILM_LATER,
} from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useVideoFilm } from '@furria/studio/use-video-film';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneFilm } from '@furria/ui/KkLaneFilm';
import type { FC } from 'react';

interface ActStudioFilmProps {
  screen: StudioScreen;
  takes: ActStudioTakes;
}

export const ActStudioFilm: FC<ActStudioFilmProps> = ({ screen, takes }) => {
  const film = useVideoFilm(screen, takes);
  const nudgeLocked = !film.canNudge;
  const note = film.note === null ? null : <KkLaneFilm.Note text={film.note} />;
  const bar =
    film.title === null ? null : (
      <KkLaneFilm.Bar>
        <KkLaneFilm.Caption title={film.title} meta={film.meta} />
        <KkLaneButton
          text={STUDIO_FILM_EARLIER}
          glyph="left"
          tone="ink"
          textShown={false}
          disabled={nudgeLocked}
          onPress={film.earlier}
        />
        <KkLaneButton
          text={STUDIO_FILM_LATER}
          glyph="right"
          tone="ink"
          textShown={false}
          disabled={nudgeLocked}
          onPress={film.later}
        />
        <KkLaneButton text={STUDIO_FILM_EDIT} tone="ink" onPress={film.edit} />
      </KkLaneFilm.Bar>
    );

  return (
    <KkLaneFilm label={STUDIO_FILM}>
      <KkLaneFilm.Video source={film.source} videoRef={film.ref} />
      {note}
      {bar}
    </KkLaneFilm>
  );
};
