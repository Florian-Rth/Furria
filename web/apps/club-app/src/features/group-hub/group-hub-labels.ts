import type { KkConfirmFact, KkDateQuickChoice } from '@furria/ui';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { toGroupSubline } from '@/lib/group-sections';
import { formatIsoDay, formatSinceSession } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import { GROUP_ADMIN_CHIP, toRecruitingChip } from '@/lib/state-chips';
import type { HubDetails } from './schemas';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;
const HUB_TITLE_FALLBACK = 'Meine Gruppe';

const MEMBER_EYEBROW = 'du bist hier dabei';
const GROUP_ADMIN_EYEBROW = 'du bist Gruppen-Admin';

export const toHubId = (raw: string): number | null =>
  GROUP_ID_PATTERN.test(raw) ? Number(raw) : null;

export interface HubHeadline {
  title: string;
  eyebrow: string | null;
  chips: StateChip[];
  subline: string | null;
}

const toStandingEyebrow = (
  ownRow: GroupDetailMember | undefined,
  viewerIsAdmin: boolean,
): string => {
  if (ownRow !== undefined) {
    return `${MEMBER_EYEBROW} seit ${formatSinceSession(ownRow.since)}`;
  }

  return viewerIsAdmin ? GROUP_ADMIN_EYEBROW : MEMBER_EYEBROW;
};

export const toHubHeadline = (
  hub: HubDetails | undefined,
  viewerPersonId: number | null,
): HubHeadline => {
  if (hub === undefined) {
    return { title: HUB_TITLE_FALLBACK, eyebrow: null, chips: [], subline: null };
  }

  const ownRow = hub.members.find((member) => member.personId === viewerPersonId);
  const openness = toRecruitingChip(hub.isRecruiting);

  return {
    title: hub.name,
    eyebrow: toStandingEyebrow(ownRow, hub.viewerIsAdmin),
    chips: hub.viewerIsAdmin ? [openness, GROUP_ADMIN_CHIP] : [openness],
    subline: toGroupSubline(hub.members.length, hub.admins.length),
  };
};

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
  member: GroupDetailMember,
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
  admin: GroupDetailAdmin,
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
