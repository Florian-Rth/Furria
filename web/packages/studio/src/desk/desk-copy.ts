export const DESK_LABEL = 'Sessionsauftritt bearbeiten';
export const DESK_READOUT = 'Position';
export const DESK_LANES = 'Spuren: Teile, Schritte, Musik, Video, Wegpunkte';
export const DESK_OVERVIEW_AIM = 'Ganzer Auftritt: tippen, um dorthin zu springen';
export const DESK_BRACKET =
  'Sichtbarer Ausschnitt: ziehen zum Verschieben, Ränder ziehen zum Zoomen, Pfeiltasten';
export const DESK_ACTIONS = 'Aktionen';
export const DESK_EARLIER_COUNT = 'Eine Zählzeit früher';
export const DESK_LATER_COUNT = 'Eine Zählzeit später';
const TENTHS = 10;
const SECONDS_PER_MINUTE = 60;
const COUNTS_PER_EIGHT = 8;

export const clockOf = (seconds: number): string => {
  const tenths = Math.round(Math.max(0, seconds) * TENTHS);
  const minutes = Math.floor(tenths / (SECONDS_PER_MINUTE * TENTHS));
  const rest = (tenths % (SECONDS_PER_MINUTE * TENTHS)) / TENTHS;
  const [whole, fraction = '0'] = rest.toFixed(1).split('.');

  return `${minutes}:${(whole ?? '0').padStart(2, '0')},${fraction}`;
};

export const countShapeOf = (counts: number): string => {
  const eights = Math.floor(counts / COUNTS_PER_EIGHT);
  const rest = counts % COUNTS_PER_EIGHT;
  const eightText = eights > 0 ? `${eights} × 8` : '';
  const restText = rest > 0 ? `${rest}` : '';

  return [eightText, restText].filter((part) => part !== '').join(' + ');
};

export const readoutCountOf = (eight: number | null, count: number | null): string =>
  eight === null || count === null ? '–' : `${eight} · ${count}`;

export const newPartNameOf = (number: number): string => `Teil ${number}`;

export const borderLabelOf = (before: string, after: string): string =>
  `Grenze zwischen ${before} und ${after}: ziehen oder Pfeiltasten`;

export const videoBlockLabelOf = (name: string): string => `Video ${name}: wählen und ziehen`;

export const amountOf = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const spotsAmountOf = (count: number): string => amountOf(count, 'Platz', 'Plätze');

export const keyLabelOf = (seconds: number, spots: number): string =>
  `Wegpunkt ${clockOf(seconds)} · ${spotsAmountOf(spots)}: wählen, ziehen oder Pfeiltasten`;

export const spotTitleOf = (number: number, name: string | null): string =>
  name === null ? `Platz ${number}` : `${number} · ${name}`;

export const facingTextOf = (degrees: number | null): string =>
  degrees === null ? 'nach vorn' : `${Math.round(degrees)} Grad`;

export const bracketTextOf = (start: number, end: number): string =>
  `${clockOf(start)} bis ${clockOf(end)}`;
