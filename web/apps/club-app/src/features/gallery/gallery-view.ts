import type { KkFrameState } from '@furria/ui';
import type { GalleryScene } from './gallery-scenes';
import { frameNumberOf } from './gallery-scenes';
import type { GalleryMedia, GalleryMediaUrls, MediaKind } from './schemas';

const GERMAN = new Intl.NumberFormat('de-DE');
const CLOCK = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const SECONDS_PER_MINUTE = 60;
const CENTURY = 100;

export const countLabel = (count: number): string => GERMAN.format(count);

export const clockLabel = (instant: string | null): string =>
  instant === null ? '' : CLOCK.format(new Date(instant));

export const hourLabel = (instant: string | null): string | null =>
  instant === null ? null : clockLabel(instant).slice(0, 2);

export const dayLabel = (instant: string | null): string | null =>
  instant === null ? null : DAY.format(new Date(instant));

export const sessionLabel = (startYear: number): string =>
  `${startYear}/${String((startYear + 1) % CENTURY).padStart(2, '0')}`;

export const durationLabel = (seconds: number | null): string | undefined => {
  if (seconds === null) {
    return undefined;
  }
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  return `${minutes}:${String(whole % SECONDS_PER_MINUTE).padStart(2, '0')}`;
};

export interface MediaCounts {
  photos: number;
  videos: number;
}

export const countsLine = ({ photos, videos }: MediaCounts): string => {
  const photoPart = `${countLabel(photos)} ${photos === 1 ? 'Foto' : 'Fotos'}`;
  if (videos === 0) {
    return photoPart;
  }
  return `${photoPart} · ${countLabel(videos)} ${videos === 1 ? 'Video' : 'Videos'}`;
};

export const sceneSpanLabel = <TFrame extends { id: number; capturedAt: string | null }>(
  scene: GalleryScene<TFrame>,
): string => {
  const from = clockLabel(scene.startsAt);
  const to = clockLabel(scene.endsAt);
  if (from === '') {
    return `Bild ${scene.firstNumber}–${scene.lastNumber}`;
  }
  return from === to || to === '' ? from : `${from}–${to}`;
};

export const frameSpanLabel = <TFrame extends { id: number; capturedAt: string | null }>(
  scene: GalleryScene<TFrame>,
): string => `#${frameNumberOf(scene.firstNumber)}–${frameNumberOf(scene.lastNumber)}`;

export interface RailScene {
  id: string;
  hour: string | null;
  time: string;
}

export const railScenesOf = <TFrame extends { id: number; capturedAt: string | null }>(
  scenes: readonly GalleryScene<TFrame>[],
): RailScene[] =>
  scenes.map((scene, index) => {
    const hour = hourLabel(scene.startsAt);
    const previousHour = index === 0 ? null : hourLabel(scenes[index - 1]?.startsAt ?? null);
    return {
      id: `szene-${scene.index}`,
      hour: hour !== null && hour !== previousHour ? hour : null,
      time: clockLabel(scene.startsAt) || `${scene.firstNumber}`,
    };
  });

export const thumbSourceOf = (urls: GalleryMediaUrls): string => urls.small;

export const viewSourceOf = (kind: MediaKind, urls: GalleryMediaUrls): string =>
  kind === 'video' ? (urls.poster ?? urls.small) : (urls.large ?? urls.medium ?? urls.small);

export const frameStateOf = (media: Pick<GalleryMedia, 'state'>): KkFrameState => {
  switch (media.state) {
    case 'ready':
      return 'ready';
    case 'processing':
      return 'processing';
    case 'failed':
      return 'failed';
  }
};

export const shownSourceOf = (media: Pick<GalleryMedia, 'state' | 'urls'>): string | undefined =>
  media.state === 'ready' ? thumbSourceOf(media.urls) : undefined;

export const personNameOf = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;
