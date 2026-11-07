import { PRACTICE_FULLSCREEN, PRACTICE_FULLSCREEN_EXIT } from '@furria/studio/practice-copy';
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
import { KkVideo } from '@furria/ui/KkVideo';
import { useKkFullscreen } from '@furria/ui/use-kk-fullscreen';
import type { FC } from 'react';

interface ActStudioFilmProps {
  screen: StudioScreen;
  takes: ActStudioTakes;
}

export const ActStudioFilm: FC<ActStudioFilmProps> = ({ screen, takes }) => {
  const film = useVideoFilm(screen, takes);
  const fullscreen = useKkFullscreen();
  const { practice } = screen;
  const nudgeLocked = !film.canNudge;
  const edit = (): void => {
    if (fullscreen.active) {
      fullscreen.toggle();
    }
    film.edit();
  };
  const note = film.note === null ? null : <KkVideo.Note text={film.note} />;
  const play = fullscreen.active ? (
    <KkVideo.Play
      playing={practice.playing}
      label={practice.playLabel}
      onToggle={practice.toggle}
    />
  ) : null;
  const bar =
    film.title === null ? null : (
      <KkVideo.Bar>
        {play}
        <KkVideo.Caption title={film.title} meta={film.meta} />
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
        <KkLaneButton text={STUDIO_FILM_EDIT} tone="ink" onPress={edit} />
        <KkVideo.Fullscreen
          fullscreen={fullscreen}
          enterLabel={PRACTICE_FULLSCREEN}
          exitLabel={PRACTICE_FULLSCREEN_EXIT}
        />
      </KkVideo.Bar>
    );

  return (
    <KkVideo label={STUDIO_FILM} fit="band" fullscreen={fullscreen}>
      <KkVideo.Picture
        label={STUDIO_FILM}
        source={film.source}
        videoRef={film.ref}
        mirrored={false}
        focus="centre"
      />
      {note}
      {bar}
    </KkVideo>
  );
};
