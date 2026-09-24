import type {
  KkConfirmFact,
  KkDateQuickChoice,
  KkGroupStageAnniversary,
  KkScreenOrigin,
} from '@furria/ui';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import { toGroupKindId, toGroupKindValue } from '@/features/group-kinds';
import { toAnniversary, toFoundedLine } from '@/features/groups';
import { GROUPS_ORIGIN, PROFILE_ORIGIN } from '@/features/session';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { toGroupAdminsLabel, toGroupMembersLabel } from '@/lib/group-sections';
import type { GroupTone } from '@/lib/group-tone';
import { formatIsoDay, formatPeriod, formatSinceSession } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import { toRecruitingChip } from '@/lib/state-chips';
import type { HubPerson } from './hub-people';
import type { GroupHub, GroupInfoForm } from './schemas';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;
const HUB_TITLE_FALLBACK = 'Gruppe';

const MEMBER_LINE_PREFIX = 'Du bist Mitglied seit ';
const LEADING_LINE = 'Du leitest diese Gruppe';
const ANNIVERSARY_CAPTION = 'JAHRE';

export const toHubId = (raw: string): number | null =>
  GROUP_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toEntryId = (raw: string): number | null =>
  GROUP_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toPersonIdParam = (raw: string | undefined): number | null => {
  if (raw === undefined || !GROUP_ID_PATTERN.test(raw)) {
    return null;
  }

  return Number(raw);
};

export const toHubTitle = (hub: GroupHub | undefined): string =>
  hub === undefined ? HUB_TITLE_FALLBACK : hub.name;

export const toHubOrigin = (viewerIsAffiliated: boolean | null): KkScreenOrigin =>
  viewerIsAffiliated === false ? PROFILE_ORIGIN : GROUPS_ORIGIN;

const HUB_ROUTE = '/groups/$groupId';

export const toHubEditorOrigin = (hub: GroupHub): KkScreenOrigin => ({
  label: hub.name,
  to: HUB_ROUTE,
  params: { groupId: String(hub.groupId) },
});

export const toStandingLine = (hub: GroupHub): string | null => {
  if (hub.viewerSince !== null) {
    return `${MEMBER_LINE_PREFIX}${formatSinceSession(hub.viewerSince)}`;
  }
  if (hub.viewerIsAdmin) {
    return LEADING_LINE;
  }

  return null;
};

export const toHubMetaFacts = (hub: GroupHub): string[] => {
  const founded = toFoundedLine(hub.foundedYear);
  const facts = [toGroupMembersLabel(hub.members.length), toGroupAdminsLabel(hub.admins.length)];

  return founded === null ? facts : [founded, ...facts];
};

export const toHubRecruitingChip = (hub: GroupHub): StateChip | null =>
  hub.isRecruiting ? toRecruitingChip(true) : null;

export const toAnniversarySeal = (
  foundedYear: number | null,
  sessionYear: number,
): KkGroupStageAnniversary | null => {
  const anniversary = toAnniversary(foundedYear, sessionYear);

  if (anniversary === null) {
    return null;
  }

  return { yearsLabel: String(anniversary.years), caption: ANNIVERSARY_CAPTION };
};

export const toMemberSinceLine = (since: string): string => `seit ${formatSinceSession(since)}`;

export interface EntryChainRow {
  key: string;
  span: string;
  isEdited: boolean;
}

export const toMembershipChainRows = (
  hub: GroupHub,
  personId: number,
  editedMembershipId: number | null,
): EntryChainRow[] => {
  const toRow = (member: GroupDetailMember): EntryChainRow => ({
    key: String(member.groupMembershipId),
    span: formatPeriod(member.joinedOn, member.leftOn),
    isEdited: member.groupMembershipId === editedMembershipId,
  });

  return [
    ...hub.members.filter((member) => member.personId === personId).map(toRow),
    ...hub.pastMembers.filter((member) => member.personId === personId).map(toRow),
  ];
};

export const toAdminChainRows = (
  hub: GroupHub,
  personId: number,
  editedAdminId: number | null,
): EntryChainRow[] => {
  const toRow = (admin: GroupDetailAdmin): EntryChainRow => ({
    key: String(admin.groupAdminId),
    span: formatPeriod(admin.sinceOn, admin.untilOn),
    isEdited: admin.groupAdminId === editedAdminId,
  });

  return [
    ...hub.admins.filter((admin) => admin.personId === personId).map(toRow),
    ...hub.pastAdmins.filter((admin) => admin.personId === personId).map(toRow),
  ];
};

export const GROUP_ADMIN_ACCENT = 'Gruppen-Admin';

export const toPersonAccent = (person: HubPerson): string | undefined => {
  if (person.groupAdminId === null) {
    return undefined;
  }

  return person.adminFunction ?? GROUP_ADMIN_ACCENT;
};

export const toPersonMetaLine = (person: HubPerson, canManage: boolean): string | undefined => {
  if (!canManage) {
    return undefined;
  }
  if (person.memberSince !== null) {
    return toMemberSinceLine(person.memberSince);
  }
  if (person.adminSince !== null) {
    return `leitet seit ${formatSinceSession(person.adminSince)}`;
  }

  return undefined;
};

export const toPersonStandingLines = (person: HubPerson): string[] => {
  const lines: string[] = [];

  if (person.memberSince !== null) {
    lines.push(`Mitglied seit ${formatSinceSession(person.memberSince)}`);
  }
  if (person.adminSince !== null) {
    lines.push(`Gruppen-Admin seit ${formatSinceSession(person.adminSince)}`);
  }

  return lines;
};

export const HUB_DENIED_MESSAGE =
  'Dein Konto ist noch keiner Person im Verein zugeordnet. Wende dich an die Personenverwaltung.';

export const EDITOR_DENIED_MESSAGE =
  'Nur Gruppen-Admins und die Gruppenverwaltung können die Gruppe bearbeiten.';

export const ADMINISTRATION_DENIED_MESSAGE =
  'Nur die Gruppenverwaltung kann Name und Gruppenart ändern.';

export const PERSON_SCREEN_OPEN_LABEL = 'Zum Profil';
export const PERSON_SCREEN_CONTACT_NOTE = 'Kontaktdaten findest du im Profil der Person.';
export const PERSON_SCREEN_UNREACHABLE_NOTE =
  'Diese Person hat kein Profil im Verzeichnis. Wende dich an die Gruppen-Admins.';
export const PERSON_SCREEN_ADD_MEMBERSHIP_LABEL = 'Mitglied aufnehmen';
export const PERSON_SCREEN_ADD_ADMIN_LABEL = 'Gruppen-Admin ernennen';

export type GroupInfoPayload = {
  description: string;
  isRecruiting: boolean;
  groupKindId: number | null;
  foundedYear: number | null;
  tone: GroupTone | null;
};

export const toGroupInfoPayload = (form: GroupInfoForm): GroupInfoPayload => ({
  description: form.description,
  isRecruiting: form.isRecruiting,
  groupKindId: toGroupKindId(form.groupKindId),
  foundedYear: form.foundedYear === '' ? null : Number(form.foundedYear),
  tone: form.tone === '' ? null : form.tone,
});

export interface GroupInfoFormOverrides {
  isRecruiting?: boolean;
}

export const toGroupInfoFormValues = (
  hub: GroupHub,
  overrides: GroupInfoFormOverrides = {},
): GroupInfoForm => ({
  description: hub.description,
  isRecruiting: overrides.isRecruiting ?? hub.isRecruiting,
  groupKindId: toGroupKindValue(hub.groupKindId),
  foundedYear: hub.foundedYear === null ? '' : String(hub.foundedYear),
  tone: hub.tone ?? '',
});

export interface GroupToneHolder {
  groupId: number;
  tone: GroupTone | null;
}

export const toTakenTones = (
  groups: readonly GroupToneHolder[],
  groupId: number,
): ReadonlySet<GroupTone> => {
  const taken = new Set<GroupTone>();

  for (const group of groups) {
    if (group.groupId !== groupId && group.tone !== null) {
      taken.add(group.tone);
    }
  }

  return taken;
};

const TONE_LABELS: Record<GroupTone, string> = {
  clay: 'Ton',
  olive: 'Oliv',
  lime: 'Limette',
  fern: 'Farn',
  teal: 'Petrol',
  indigo: 'Indigo',
  iris: 'Iris',
  violet: 'Violett',
  orchid: 'Orchidee',
  rose: 'Rosé',
};

export const toToneLabel = (tone: GroupTone): string => TONE_LABELS[tone];

export const toToneWarning = (
  tone: GroupTone | '',
  takenTones: ReadonlySet<GroupTone>,
): string | null => {
  if (tone === '' || !takenTones.has(tone)) {
    return null;
  }

  return `${TONE_LABELS[tone]} ist bereits einer anderen Gruppe zugewiesen.`;
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
    : `Es werden nur die ersten ${SEARCH_RESULT_CAP} Treffer angezeigt. Präzisiere die Suche.`;

export const toNoSearchResultLine = (term: string): string => `Keine Treffer für „${term}“.`;

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

export const toMemberAddedAsAdminMessage = (
  personName: string,
  joinedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(joinedOn, todayIsoDay)
    ? `${personName} ist ab dem ${formatIsoDay(joinedOn)} dabei und Gruppen-Admin.`
    : `${personName} ist aufgenommen und Gruppen-Admin.`;

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
    ? `${personName} gehört ab dem ${formatIsoDay(joinedOn)} zur Gruppe.`
    : `${personName} gehört seit dem ${formatIsoDay(joinedOn)} zur Gruppe.`;

export const toJoinAsAdminConsequence = (
  personName: string,
  joinedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(joinedOn, todayIsoDay)
    ? `${personName} gehört ab dem ${formatIsoDay(joinedOn)} zur Gruppe und ist Gruppen-Admin.`
    : `${personName} gehört seit dem ${formatIsoDay(joinedOn)} zur Gruppe und ist Gruppen-Admin.`;

export const toEndConsequence = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Die Zugehörigkeit von ${personName} endet am ${formatIsoDay(endedOn)}. Sie bleibt im Verlauf erhalten.`
    : `Die Zugehörigkeit von ${personName} ist zum ${formatIsoDay(endedOn)} beendet. Sie bleibt im Verlauf erhalten.`;

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
    ? `${personName} ist ab dem ${formatIsoDay(sinceOn)} Gruppen-Admin und kann die Gruppe verwalten.`
    : `${personName} ist seit dem ${formatIsoDay(sinceOn)} Gruppen-Admin und kann die Gruppe verwalten.`;

export const toAdminEndConsequence = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `${personName} ist ab dem ${formatIsoDay(endedOn)} nicht mehr Gruppen-Admin. Die Zugehörigkeit zur Gruppe bleibt bestehen.`
    : `${personName} ist ab sofort nicht mehr Gruppen-Admin. Die Zugehörigkeit zur Gruppe bleibt bestehen.`;

export const toLastAdminWarning = (runningAdmins: number): string | null =>
  runningAdmins > 1 ? null : 'Die Gruppe hat danach keinen Gruppen-Admin mehr.';

const SENTENCE_SEPARATOR = ' ';

const SELF_ADMIN_END_NOTE =
  'Du beendest deine eigene Ernennung und kannst die Gruppe danach nicht mehr bearbeiten.';

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
    ? `Ab dem ${formatIsoDay(endedOn)} bist du nicht mehr Gruppen-Admin von ${groupName}.`
    : `Du bist nicht mehr Gruppen-Admin von ${groupName}.`;

export const toGroupAdministrationSavedMessage = (name: string): string =>
  `${name} ist gespeichert.`;

const NOBODY_LINE = 'Es ist niemand eingetragen.';

const toGroupMembershipClause = (
  count: number,
  singularVerb: string,
  pluralVerb: string,
): string => {
  if (count === 0) {
    return NOBODY_LINE;
  }
  if (count === 1) {
    return `1 Zugehörigkeit ${singularVerb}.`;
  }

  return `${count} Zugehörigkeiten ${pluralVerb}.`;
};

export const ARCHIVE_GROUP_EYEBROW = 'Gruppe archivieren';
export const ARCHIVE_GROUP_EXPLANATION =
  'Die Gruppe verschwindet aus dem Verzeichnis und zählt nicht mehr für die Vereinsbindung. Zugehörigkeiten bleiben erhalten.';

export const toArchiveGroupQuestion = (name: string): string => `${name} archivieren?`;

export const toArchiveGroupConsequence = (
  name: string,
  memberCount: number,
  todayLabel: string,
): string =>
  `Ab dem ${todayLabel} ist ${name} archiviert. ${toGroupMembershipClause(memberCount, 'bleibt bestehen', 'bleiben bestehen')}`;

export const toArchiveGroupFacts = (hub: GroupHub, todayLabel: string): KkConfirmFact[] => [
  { label: 'Gruppe', value: hub.name },
  { label: 'Personen', value: String(hub.members.length) },
  { label: 'Gruppen-Admins', value: String(hub.admins.length) },
  { label: 'Ab', value: todayLabel },
];

export const toGroupArchivedFromHubMessage = (name: string): string => `${name} ist archiviert.`;
