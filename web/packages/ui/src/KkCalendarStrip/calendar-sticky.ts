import { kkTokens } from '../tokens';

const { gutter, barHeight, chromeGap, navHeight } = kkTokens.shell;
const { grip, head, weekdays, cell } = kkTokens.calendarStrip;

const STRIP_PAD = 4;
const HEAD_GAP = 6;

export const KK_CALENDAR_STICKY = {
  stripTop: gutter + barHeight + chromeGap,
  stripPad: STRIP_PAD,
  stripHead: head,
  stripWeekdays: weekdays,
  stripCell: cell,
  stripGrip: grip,
  stripHeight: STRIP_PAD + head + weekdays + cell + grip,
  headGap: HEAD_GAP,
  chromeGap,
  dayHead: 40,
  foot: navHeight + gutter * 2,
} as const;

export const KK_CALENDAR_HEAD_TOP = {
  strip: KK_CALENDAR_STICKY.stripTop + KK_CALENDAR_STICKY.stripHeight + HEAD_GAP,
  chrome: KK_CALENDAR_STICKY.stripTop,
} as const;

export type KkCalendarHeadUnder = keyof typeof KK_CALENDAR_HEAD_TOP;
