export const joinContactKicker = 'LIEBER KURZ FRAGEN?';

export const joinContactTitle = 'EINE MAIL REICHT.';

export const joinContactText =
  'Unsicher, ob eine Gruppe zu dir passt? Eine Frage, die oben nicht steht? Schreib uns — es antwortet ein Mensch, und du musst dafür keinen Antrag stellen.';

const OFFICIAL_CHANNEL = 'Das ist unser offizieller Kanal.';

export const buildJoinContactNote = (phone: string | null): string =>
  phone === null
    ? `${OFFICIAL_CHANNEL} Eine Telefonnummer für Anfragen gibt es nicht — dafür liest jede Mail ein Mensch, der dir auch antwortet.`
    : `${OFFICIAL_CHANNEL} Lieber anrufen? Du erreichst uns auch unter ${phone}.`;
