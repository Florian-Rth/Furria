import type { ActKind, FindingKind, RuleKind, Severity, Strength } from './schemas';

export const ACT_LABEL = 'Auftritt';
export const ACTS_LABEL = 'Auftritte';
export const UNPLACED_LABEL = 'Noch nicht eingeplant';
export const PINNED_LABEL = 'Fester Platz';
export const BLOCK_LABEL = 'Bleiben zusammen';
export const ABSENT_LABEL = 'Abgesagt';
export const SUGGESTION_LABEL = 'Vorschlag';
export const NO_SUGGESTION_MESSAGE = 'Besser geht es mit dieser Reihenfolge nicht.';
export const CONFIRMED_LABEL = 'Ablauf steht';
export const CHANGED_SINCE_CONFIRMED_LABEL = 'Seit der Bestätigung geändert';
export const CONFLICT_SAVE_MESSAGE =
  'Jemand anderes hat den Ablauf gerade geändert. Lade ihn neu, bevor du weitermachst.';
export const CONFIRM_WITH_CONFLICTS_MESSAGE =
  'Im Ablauf gibt es noch Probleme. Trotzdem als fertig markieren?';
export const RUNNING_ORDER_DELETED_MESSAGE = 'Ablauf gelöscht.';

const ACT_KIND_LABELS: Record<ActKind, string> = {
  dance: 'Tanz',
  speech: 'Rede',
  music: 'Musik',
  show: 'Show',
  point: 'Ablaufpunkt',
};

const ACT_KIND_PLURALS: Record<ActKind, string> = {
  dance: 'Tänze',
  speech: 'Reden',
  music: 'Musikstücke',
  show: 'Shows',
  point: 'Ablaufpunkte',
};

export const toActKindLabel = (kind: ActKind): string => ACT_KIND_LABELS[kind];

export const toActKindPlural = (kind: ActKind): string => ACT_KIND_PLURALS[kind];

const STRENGTH_LABELS: Record<Strength, string> = {
  must: 'Muss',
  prefer: 'Möglichst',
};

const STRENGTH_WORDS: Record<Strength, string> = {
  must: 'muss',
  prefer: 'möglichst',
};

export const toStrengthLabel = (strength: Strength): string => STRENGTH_LABELS[strength];

export const toStrengthWord = (strength: Strength): string => STRENGTH_WORDS[strength];

type PlacePhraseKind = Exclude<RuleKind, 'before' | 'after' | 'apart' | 'kindSpread'>;

const PLACE_PHRASES: Record<PlacePhraseKind, string> = {
  first: 'ganz am Anfang',
  last: 'ganz am Ende',
  firstHalf: 'in der ersten Hälfte',
  secondHalf: 'in der zweiten Hälfte',
  early: 'früh am Abend',
  late: 'spät am Abend',
};

const RELATION_PHRASES: Record<'before' | 'after' | 'apart', (other: string) => string> = {
  before: (other) => `vor ${other}`,
  after: (other) => `nach ${other}`,
  apart: (other) => `mit Abstand zu ${other}`,
};

const RULE_KIND_LABELS: Record<RuleKind, string> = {
  first: 'Ganz am Anfang',
  last: 'Ganz am Ende',
  firstHalf: 'In der ersten Hälfte',
  secondHalf: 'In der zweiten Hälfte',
  early: 'Früh am Abend',
  late: 'Spät am Abend',
  before: 'Vor einem anderen Auftritt',
  after: 'Nach einem anderen Auftritt',
  apart: 'Mit Abstand zu einem anderen Auftritt',
  kindSpread: 'Nicht direkt hintereinander',
};

export const toRuleKindLabel = (kind: RuleKind): string => RULE_KIND_LABELS[kind];

export interface RuleSentenceParts {
  kind: RuleKind;
  strength: Strength;
  actName: string | null;
  otherActName: string | null;
  actKind: ActKind | null;
}

const UNKNOWN_ACT = 'einem anderen Auftritt';

export const toRulePhrase = ({
  kind,
  otherActName,
  actKind,
}: Omit<RuleSentenceParts, 'strength' | 'actName'>): string => {
  switch (kind) {
    case 'before':
    case 'after':
    case 'apart':
      return RELATION_PHRASES[kind](otherActName ?? UNKNOWN_ACT);
    case 'kindSpread':
      return `zwei ${actKind === null ? ACTS_LABEL : toActKindPlural(actKind)} direkt hintereinander`;
    default:
      return PLACE_PHRASES[kind];
  }
};

export const toRuleSentence = (parts: RuleSentenceParts): string => {
  const phrase = toRulePhrase(parts);

  if (parts.kind === 'kindSpread') {
    return parts.strength === 'must' ? `Nie ${phrase}` : `Möglichst nicht ${phrase}`;
  }

  const subject = parts.actName ?? ACT_LABEL;

  return parts.strength === 'must'
    ? `${subject} muss ${phrase} kommen`
    : `${subject} möglichst ${phrase}`;
};

const SEVERITY_LABELS: Record<Severity, string> = {
  conflict: 'Problem',
  hint: 'Hinweis',
};

export const toSeverityLabel = (severity: Severity): string => SEVERITY_LABELS[severity];

const FINDING_TITLES: Record<FindingKind, string> = {
  noChangeover: 'Keine Umziehzeit',
  tightChangeover: 'Knapper Wechsel',
  mustRuleBroken: 'Fester Wunsch nicht erfüllt',
  preferRuleMissed: 'Wunsch nicht erfüllt',
  sameKindAdjacent: 'Zwei Reden hintereinander',
  nobodyThere: 'Alle haben abgesagt',
  absences: 'Absagen',
  unplaced: 'Noch nicht eingeplant',
};

export const toFindingTitle = (kind: FindingKind): string => FINDING_TITLES[kind];

const NAME_LIST = new Intl.ListFormat('de-DE', { style: 'long', type: 'conjunction' });

export const toNameList = (names: readonly string[]): string => NAME_LIST.format(names);

export interface FindingSentenceParts {
  kind: FindingKind;
  lineNames: readonly string[];
  personNames: readonly string[];
  ruleSentence: string | null;
}

const SOMEONE = 'Jemand';

export const toFindingSentence = ({
  kind,
  lineNames,
  personNames,
  ruleSentence,
}: FindingSentenceParts): string => {
  const [first = ACT_LABEL, second = ACT_LABEL] = lineNames;
  const persons = personNames.length === 0 ? SOMEONE : toNameList(personNames);
  const plural = personNames.length > 1;

  switch (kind) {
    case 'noChangeover':
      return `${persons} ${plural ? 'stehen' : 'steht'} in ${first} und direkt danach in ${second}.`;
    case 'tightChangeover':
      return `${persons}: nur ein Auftritt zwischen ${first} und ${second}.`;
    case 'mustRuleBroken':
    case 'preferRuleMissed':
      return ruleSentence === null ? FINDING_TITLES[kind] : `${ruleSentence}.`;
    case 'sameKindAdjacent':
      return `${first} und ${second} sind zwei Reden direkt hintereinander.`;
    case 'nobodyThere':
      return `Bei ${first} haben alle abgesagt.`;
    case 'absences':
      return `${persons} ${plural ? 'haben' : 'hat'} für ${first} abgesagt.`;
    case 'unplaced':
      return lineNames.length === 1
        ? `${first} ist noch nicht eingeplant.`
        : `${toNameList(lineNames)} sind noch nicht eingeplant.`;
    default:
      return FINDING_TITLES[kind];
  }
};

export const toFindingTallyLabel = (conflicts: number, hints: number): string => {
  const parts = [
    conflicts === 0 ? null : `${conflicts} ${conflicts === 1 ? 'Problem' : 'Probleme'}`,
    hints === 0 ? null : `${hints} ${hints === 1 ? 'Hinweis' : 'Hinweise'}`,
  ].filter((part): part is string => part !== null);

  return parts.length === 0 ? 'Alles passt' : parts.join(' · ');
};

export const toActCreatedMessage = (name: string): string => `${name} angelegt.`;

export const toActSavedMessage = (name: string): string => `${name} gespeichert.`;

export const toActArchivedMessage = (name: string, archived: boolean): string =>
  archived ? `${name} archiviert.` : `${name} wiederhergestellt.`;

export const toActWithdrawnMessage = (name: string): string =>
  `${name} steht in keinem offenen Abend mehr.`;

export const WITHDRAW_LABEL = 'Aus allen offenen Abenden nehmen';

export const toConfirmationMessage = (confirmed: boolean): string =>
  confirmed ? 'Ablauf steht.' : 'Ablauf wieder offen.';
