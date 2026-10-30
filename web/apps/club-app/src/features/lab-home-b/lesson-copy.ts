import type { OwnCue } from '@/features/act-practice/practice-way';
import type { EightPlace } from './lesson-counts';

export const LESSON_LABEL = 'Zuhause üben';
export const LESSON_PICTURE_LABEL = 'Trainervideo und deine Bühne';
export const LESSON_TO_STAGE = 'Deine Bühne groß zeigen';
export const LESSON_TO_VIDEO = 'Trainervideo groß zeigen';
export const LESSON_LOOP = 'Wiederholen';
export const LESSON_LOOP_ON = 'Dieser Schritt wird wiederholt, tippen spielt weiter';
export const LESSON_LOOP_OFF = 'Diesen Schritt wiederholen';
export const LESSON_NO_DESCRIPTION = 'Zu diesem Schritt gibt es noch keine Beschreibung.';
export const LESSON_READ_LABEL = 'Schritt ganz lesen';
export const LESSON_READ_CLOSE = 'Schließen';
export const LESSON_DOCK_LABEL = 'Abspielen, Tempo und Gruppentraining';
export const LESSON_NO_PART = 'Ohne Teil';
export const LESSON_NEXT = 'Danach';
export const LESSON_LAST = 'Das war der letzte Schritt';

export const LESSON_EMPTY_EYEBROW = 'Noch nichts zum Üben';
export const LESSON_EMPTY_NAME = 'Noch keine Musik';
export const LESSON_EMPTY_PICTURE = 'Hier läuft bald das Trainervideo';
export const LESSON_EMPTY_TEXT =
  'Sobald die Musik und die Schritte angelegt sind, übst du hier Schritt für Schritt: mit Trainervideo, deinem Platz und deinem Weg.';

export const lessonEyebrowOf = (part: string | null, number: number, total: number): string => {
  const place = `${number} von ${total}`;

  return part === null ? place : `${part} · ${place}`;
};

export const lessonCardLabelOf = (name: string): string => `Aktueller Schritt: ${name}`;

export const nextLabelOf = (name: string | null): string =>
  name === null ? LESSON_LAST : `Danach: ${name}, dorthin springen`;

export const railStepLabelOf = (name: string): string => `${name}: hierhin springen`;

export const railGroupLabelOf = (part: string | null): string =>
  part === null ? LESSON_NO_PART : `Teil ${part}`;

export const countsLabelOf = (place: EightPlace | null): string =>
  place === null ? 'Der Schritt beginnt gleich' : `Achter ${place.eight} von ${place.eights}`;

export const cueLabelOf = (cue: OwnCue | null): string => {
  if (cue === null) {
    return 'Dein Platz: stehen bleiben';
  }

  return cue.tone === 'now'
    ? 'Dein Weg: jetzt loslaufen'
    : `Dein Weg beginnt in ${cue.counts} Zählzeiten`;
};
