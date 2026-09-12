import type { KkConfirmFact, KkDateQuickChoice } from '@furria/ui';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { toGroupSubline } from '@/lib/group-sections';
import { formatIsoDay, formatPeriod, formatSinceSession } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import { toRecruitingChip } from '@/lib/state-chips';
import type { HubAdmin, HubDetails, HubMember } from './schemas';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;
const HUB_TITLE_FALLBACK = 'Meine Gruppe';
const SUBLINE_SEPARATOR = ' · ';

const MY_GROUP_EYEBROW = 'deine Gruppe';
const CARE_LINE = 'du pflegst sie';

export const toHubId = (raw: string): number | null =>
  GROUP_ID_PATTERN.test(raw) ? Number(raw) : null;

export interface HubHeadline {
  title: string;
  eyebrow: string | null;
  openness: StateChip | null;
  subline: string | null;
}

const toStandingEyebrow = (ownSince: string | undefined): string =>
  ownSince === undefined
    ? MY_GROUP_EYEBROW
    : `${MY_GROUP_EYEBROW} seit ${formatSinceSession(ownSince)}`;

export const toHubHeadline = (
  hub: HubDetails | undefined,
  viewerPersonId: number | null,
): HubHeadline => {
  if (hub === undefined) {
    return { title: HUB_TITLE_FALLBACK, eyebrow: null, openness: null, subline: null };
  }

  const ownRow = hub.members.find((member) => member.personId === viewerPersonId);
  const counts = toGroupSubline(hub.members.length, hub.admins.length);
  const sublineParts = hub.viewerIsAdmin ? [CARE_LINE, counts] : [counts];

  return {
    title: hub.name,
    eyebrow: toStandingEyebrow(ownRow?.since),
    openness: toRecruitingChip(hub.isRecruiting),
    subline: sublineParts.join(SUBLINE_SEPARATOR),
  };
};

export type HubHistoryKind = 'membership' | 'admin';

export interface HubHistoryEntry {
  key: string;
  title: string;
  span: string;
  kind: HubHistoryKind;
  meta?: string;
}

interface DatedHistoryEntry extends HubHistoryEntry {
  startedOn: string;
}

const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

const toPastMemberEntry = (member: HubMember): DatedHistoryEntry => ({
  key: `membership-${member.groupMembershipId}`,
  title: toPersonName(member),
  span: formatPeriod(member.joinedOn, member.leftOn),
  kind: 'membership',
  startedOn: member.joinedOn,
});

const toPastAdminEntry = (admin: HubAdmin): DatedHistoryEntry => ({
  key: `admin-${admin.groupAdminId}`,
  title: toPersonName(admin),
  span: formatPeriod(admin.sinceOn, admin.untilOn),
  kind: 'admin',
  meta: admin.function ?? undefined,
  startedOn: admin.sinceOn,
});

const byNewestStart = (left: DatedHistoryEntry, right: DatedHistoryEntry): number => {
  if (left.startedOn !== right.startedOn) {
    return left.startedOn < right.startedOn ? 1 : -1;
  }

  return left.key.localeCompare(right.key);
};

export const toHistoryEntries = (
  pastMembers: readonly HubMember[],
  pastAdmins: readonly HubAdmin[],
): HubHistoryEntry[] => {
  const dated = [...pastMembers.map(toPastMemberEntry), ...pastAdmins.map(toPastAdminEntry)];

  return dated
    .sort(byNewestStart)
    .map(({ key, title, span, kind, meta }) => ({ key, title, span, kind, meta }));
};

export const toNoMembersLine = (name: string): string =>
  `In ${name} ist gerade niemand eingetragen.`;

export const toNoDescriptionLine = (name: string): string =>
  `Zu ${name} steht noch nichts geschrieben.`;

export const NO_ADMINS_LINE = 'Für diese Gruppe ist gerade niemand als Gruppen-Admin eingetragen.';

const SEARCH_TERM_MIN_LENGTH = 2;
const SEARCH_TERM_MAX_LENGTH = 64;
const SEARCH_RESULT_CAP = 25;

export const GROUP_INFO_SAVED_MESSAGE = 'Die Angaben zur Gruppe sind gespeichert.';

export const toSearchTerm = (raw: string): string | null => {
  const trimmed = raw.trim();

  if (trimmed.length < SEARCH_TERM_MIN_LENGTH) {
    return null;
  }

  return trimmed.slice(0, SEARCH_TERM_MAX_LENGTH);
};

export const toSearchCapLine = (count: number): string | null =>
  count < SEARCH_RESULT_CAP
    ? null
    : `Es werden höchstens ${SEARCH_RESULT_CAP} Treffer gezeigt. Tipp den Namen genauer.`;

export const toNoSearchResultLine = (term: string): string =>
  `Zu „${term}“ steht niemand im Register.`;

export const toJoinQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const openingValue = toIsoDay(
    new Date(session.startYear, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY),
  );

  const choices: KkDateQuickChoice[] = [{ label: 'Heute', value: todayValue }];

  if (openingValue !== todayValue) {
    choices.push({ label: 'Sessionbeginn', value: openingValue });
  }

  return choices;
};

export const toEndQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const closingValue = toIsoDay(
    new Date(session.startYear + 1, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY - 1),
  );

  const choices: KkDateQuickChoice[] = [{ label: 'Heute', value: todayValue }];

  if (closingValue !== todayValue) {
    choices.push({ label: 'Sessionende', value: closingValue });
  }

  return choices;
};

export const toMemberAddedMessage = (
  personName: string,
  joinedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(joinedOn, todayIsoDay)
    ? `${personName} ist ab dem ${formatIsoDay(joinedOn)} dabei.`
    : `${personName} ist aufgenommen.`;

export const toMembershipEndedMessage = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Die Zugehörigkeit von ${personName} endet am ${formatIsoDay(endedOn)}.`
    : `Die Zugehörigkeit von ${personName} ist beendet.`;

export const toJoinConsequence = (
  personName: string,
  joinedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(joinedOn, todayIsoDay)
    ? `Ab dem ${formatIsoDay(joinedOn)} steht ${personName} in der Gruppe — vorher nicht in der Liste.`
    : `${personName} gehört ab dem ${formatIsoDay(joinedOn)} zur Gruppe.`;

export const toEndConsequence = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Der ${formatIsoDay(endedOn)} wird der letzte Tag von ${personName} in der Gruppe. Die Zugehörigkeit bleibt in der Geschichte stehen.`
    : `Der ${formatIsoDay(endedOn)} ist der letzte Tag von ${personName} in der Gruppe. Die Zugehörigkeit bleibt in der Geschichte stehen.`;

export const toEndQuestion = (firstName: string, groupName: string): string =>
  `${firstName} aus der Gruppe ${groupName}?`;

export const toEndExplanation = (firstName: string): string =>
  `Die Zugehörigkeit endet am gewählten Tag und wandert in die Geschichte der Gruppe. Gelöscht wird nichts: ${firstName} kann jederzeit wieder aufgenommen werden.`;

export const toEndFacts = (
  member: HubMember,
  groupName: string,
  endedOn: string | null,
): KkConfirmFact[] => [
  { label: 'Person', value: `${member.firstName} ${member.lastName}` },
  { label: 'Gruppe', value: groupName },
  { label: 'Dabei seit', value: formatIsoDay(member.joinedOn) },
  { label: 'Letzter Tag', value: endedOn === null ? 'noch offen' : formatIsoDay(endedOn) },
];

export const ADMIN_FUNCTION_SUGGESTIONS: readonly string[] = [
  'Trainerin',
  'Sprecher',
  'Kommandantin',
  'Betreuerin',
];

export const toAdminFunction = (raw: string): string | null => {
  const trimmed = raw.trim();

  return trimmed === '' ? null : trimmed;
};

export const toAdminAppointedMessage = (
  personName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `${personName} ist ab dem ${formatIsoDay(sinceOn)} Gruppen-Admin.`
    : `${personName} ist jetzt Gruppen-Admin.`;

export const toAdminEndedMessage = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `${personName} ist noch bis zum ${formatIsoDay(endedOn)} Gruppen-Admin.`
    : `${personName} ist nicht mehr Gruppen-Admin.`;

export const toAppointConsequence = (
  personName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `Ab dem ${formatIsoDay(sinceOn)} darf ${personName} die Gruppe pflegen — vorher nicht.`
    : `${personName} darf die Gruppe ab dem ${formatIsoDay(sinceOn)} pflegen: Beschreibung ändern, Leute aufnehmen und beenden.`;

export const toAdminEndConsequence = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Ab dem ${formatIsoDay(endedOn)} kann ${personName} die Gruppe nicht mehr pflegen. Die Zugehörigkeit zur Gruppe bleibt davon unberührt.`
    : `${personName} kann die Gruppe ab sofort nicht mehr pflegen. Die Zugehörigkeit zur Gruppe bleibt davon unberührt.`;

export const toAdminEndQuestion = (firstName: string): string =>
  `${firstName} als Gruppen-Admin beenden?`;

export const toAdminEndExplanation = (firstName: string, groupName: string): string =>
  `Die Ernennung endet am gewählten Tag und wandert in die Geschichte der Gruppe. Gelöscht wird nichts: ${firstName} behält jede Zugehörigkeit zu ${groupName} und kann jederzeit wieder ernannt werden.`;

export const toAdminEndFacts = (
  admin: HubAdmin,
  groupName: string,
  endedOn: string | null,
): KkConfirmFact[] => [
  { label: 'Person', value: `${admin.firstName} ${admin.lastName}` },
  { label: 'Gruppe', value: groupName },
  { label: 'Funktion', value: admin.function ?? 'ohne Funktion' },
  { label: 'Admin seit', value: formatIsoDay(admin.sinceOn) },
  { label: 'Letzter Tag', value: endedOn === null ? 'noch offen' : formatIsoDay(endedOn) },
];

export const toLastAdminWarning = (runningAdmins: number): string | null =>
  runningAdmins > 1
    ? null
    : 'Danach hat diese Gruppe keinen Gruppen-Admin mehr. Die Gruppenverwaltung kann jederzeit eine neue ernennen.';

const SENTENCE_SEPARATOR = ' ';

const SELF_ADMIN_END_NOTE =
  'Das bist du. Danach kannst du die Gruppe nur noch lesen — neu ernennen kann dich die Gruppenverwaltung.';

export const toAdminEndParagraph = (
  consequence: string | null,
  isSelf: boolean,
  runningAdmins: number,
): string | null => {
  const sentences = [
    isSelf ? SELF_ADMIN_END_NOTE : null,
    consequence,
    toLastAdminWarning(runningAdmins),
  ].filter((sentence) => sentence !== null);

  return sentences.length === 0 ? null : sentences.join(SENTENCE_SEPARATOR);
};

export const toSelfAdminEndedMessage = (
  groupName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Ab dem ${formatIsoDay(endedOn)} bist du nicht mehr Gruppen-Admin von ${groupName}. Lesen kannst du sie weiter — neu ernennen kann dich die Gruppenverwaltung.`
    : `Du bist nicht mehr Gruppen-Admin von ${groupName}. Lesen kannst du sie weiter — neu ernennen kann dich die Gruppenverwaltung.`;
