import { sessionYearsLabelOf } from '@/lib/club';
import { formatCountdown } from '@/lib/countdown';
import type { GreetingAct, SeasonClause } from './greeting-act';
import type { GreetingDeck } from './greeting-decks';

export type GreetingPartRole = 'plain' | 'value' | 'name';

export interface GreetingPart {
  text: string;
  role: GreetingPartRole;
}

export type GreetingNameForm = 'vocative' | 'nameless';

export interface GreetingCopy {
  parts: GreetingPart[];
  line: string | null;
  nameForm: GreetingNameForm;
  deck: GreetingDeck;
}

type Phrase = (name: string | null) => GreetingPart[];

interface Chosen {
  parts: GreetingPart[];
  nameForm: GreetingNameForm;
}

export const GREETING_MAX_LENGTH = 40;
const NAME_MAX_LENGTH = 12;
const FIRST_ORDINAL = 1;
const WHITESPACE = /\s+/g;

const plain = (text: string): GreetingPart => ({ text, role: 'plain' });
const value = (text: string): GreetingPart => ({ text, role: 'value' });
const named = (text: string): GreetingPart => ({ text, role: 'name' });

export const toGreetingText = (parts: readonly GreetingPart[]): string =>
  parts.map((part) => part.text).join('');

const fits = (parts: readonly GreetingPart[]): boolean =>
  toGreetingText(parts).length <= GREETING_MAX_LENGTH;

const speaksName = (parts: readonly GreetingPart[]): boolean =>
  parts.some((part) => part.role === 'name');

const usableName = (firstName: string): string | null => {
  const name = firstName.trim().replace(WHITESPACE, ' ');

  return name === '' || name.length > NAME_MAX_LENGTH ? null : name;
};

const choose = (phrases: readonly Phrase[], name: string | null): Chosen => {
  for (const phrase of phrases) {
    const vocative = name === null ? null : phrase(name);

    if (vocative !== null && speaksName(vocative) && fits(vocative)) {
      return { parts: vocative, nameForm: 'vocative' };
    }

    const nameless = phrase(null);

    if (fits(nameless)) {
      return { parts: nameless, nameForm: 'nameless' };
    }
  }

  return { parts: phrases.at(-1)?.(null) ?? [], nameForm: 'nameless' };
};

const ordinalPart = (ordinal: number, firstForm: 'erste' | 'ersten'): GreetingPart =>
  ordinal === FIRST_ORDINAL ? plain(firstForm) : value(`${ordinal}.`);

const ordinalWord = (ordinal: number, firstForm: 'erste' | 'ersten'): string =>
  ordinalPart(ordinal, firstForm).text;

const untilOpeningPhrases = (days: number, ordinal: number | null): Phrase[] => {
  const club: Phrase = (name) =>
    name === null
      ? [plain('Noch '), value(String(days)), plain(' Tage bis zum 11.11.')]
      : [named(name), plain(', noch '), value(String(days)), plain(' Tage bis zum 11.11.')];

  if (ordinal === null) {
    return [club];
  }

  const member: Phrase = (name) => {
    const session = [plain(' Tage bis zu deiner '), ordinalPart(ordinal, 'ersten')];

    return name === null
      ? [plain('Noch '), value(String(days)), ...session, plain(' Session.')]
      : [value(String(days)), ...session, plain(' Session, '), named(name), plain('.')];
  };

  return [member, club];
};

const openingTomorrowPhrases = (ordinal: number | null): Phrase[] => {
  const club: Phrase = (name) =>
    name === null
      ? [plain('Morgen ist der 11.11.')]
      : [named(name), plain(', morgen ist der 11.11.')];

  if (ordinal === null) {
    return [club];
  }

  const member: Phrase = (name) => {
    const session = [ordinalPart(ordinal, 'erste'), plain(' Session.')];

    return name === null
      ? [plain('Morgen beginnt deine '), ...session]
      : [named(name), plain(', morgen beginnt deine '), ...session];
  };

  return [member, club];
};

const openingTodayPhrases = (): Phrase[] => [
  (name) =>
    name === null
      ? [plain('Heute um 11:11!')]
      : [plain('Heute um 11:11, '), named(name), plain('!')],
];

const sessionDayPhrases = (day: number, ordinal: number | null): Phrase[] => {
  const club: Phrase = (name) =>
    name === null
      ? [plain('Tag '), value(String(day)), plain(' der Session.')]
      : [plain('Tag '), value(String(day)), plain(' der Session, '), named(name), plain('.')];

  if (ordinal === null) {
    return [club];
  }

  const member: Phrase = (name) => {
    const head = [
      plain('Tag '),
      value(String(day)),
      plain(' deiner '),
      ordinalPart(ordinal, 'ersten'),
    ];

    return name === null
      ? [...head, plain(' Session.')]
      : [...head, plain(' Session, '), named(name), plain('.')];
  };

  return [member, club];
};

const untilWomensCarnivalDayPhrases = (days: number): Phrase[] => {
  if (days === 1) {
    return [
      (name) =>
        name === null
          ? [plain('Morgen ist Weiberfastnacht.')]
          : [named(name), plain(', morgen ist Weiberfastnacht.')],
    ];
  }

  return [
    (name) =>
      name === null
        ? [plain('Noch '), value(String(days)), plain(' Tage bis Weiberfastnacht.')]
        : [named(name), plain(', noch '), value(String(days)), plain(' Tage bis Weiberfastnacht.')],
  ];
};

const clausePhrases = (clause: SeasonClause, ordinal: number | null): Phrase[] => {
  if (clause.kind === 'untilOpening') {
    return untilOpeningPhrases(clause.days, ordinal);
  }
  if (clause.kind === 'openingTomorrow') {
    return openingTomorrowPhrases(ordinal);
  }
  if (clause.kind === 'openingToday') {
    return openingTodayPhrases();
  }
  if (clause.kind === 'sessionDay') {
    return sessionDayPhrases(clause.day, ordinal);
  }

  return untilWomensCarnivalDayPhrases(clause.days);
};

const plainClauseOf = (clause: SeasonClause, ordinal: number | null): string =>
  toGreetingText(choose(clausePhrases(clause, ordinal), null).parts);

const sessionLine = (act: GreetingAct, predicate: string): string =>
  act.ordinal === null
    ? `Die Session ${sessionYearsLabelOf(act.sessionYear)} ${predicate}`
    : `Deine ${ordinalWord(act.ordinal, 'erste')} Session ${predicate}`;

const thanksLine = (act: GreetingAct, name: string | null): string => {
  const club: Phrase = (spoken) => {
    const thanks = `Danke für die Session ${sessionYearsLabelOf(act.sessionYear)}`;

    return [plain(spoken === null ? `${thanks}.` : `${thanks}, ${spoken}.`)];
  };
  const ordinal = act.ordinal;

  if (ordinal === null) {
    return toGreetingText(choose([club], name).parts);
  }

  const member: Phrase = (spoken) => {
    const thanks = `Danke für deine ${ordinalWord(ordinal, 'erste')} Session`;

    return [plain(spoken === null ? `${thanks}.` : `${thanks}, ${spoken}.`)];
  };

  return toGreetingText(choose([member, club], name).parts);
};

const salutation =
  (lead: string, closing: string): Phrase =>
  (name) =>
    name === null
      ? [plain(`${lead}${closing}`)]
      : [plain(`${lead}, `), named(name), plain(closing)];

const anniversaryPhrase =
  (years: number): Phrase =>
  (name) => {
    const unit = years === 1 ? ' Jahr' : ' Jahre';
    const since = plain(`${unit} seit deinem Beitritt`);

    return name === null
      ? [value(String(years)), since, plain('!')]
      : [value(String(years)), since, plain(', '), named(name), plain('!')];
  };

const fixed =
  (text: string): Phrase =>
  () => [plain(text)];

const deckOf = (act: GreetingAct): GreetingDeck => {
  if (act.night) {
    return 'none';
  }
  if (act.moment === 'birthday') {
    return 'cheer';
  }
  if (act.moment === 'ashWednesday') {
    return 'backwards';
  }

  return 'carnival';
};

interface Composition {
  title: readonly Phrase[];
  line: string | null;
}

const compositionOf = (act: GreetingAct, name: string | null): Composition => {
  if (act.moment === 'openingCountdown') {
    return {
      title: [
        () => [plain('Noch '), value(formatCountdown(act.secondsToOpening)), plain(' bis 11:11.')],
      ],
      line: sessionLine(act, 'beginnt.'),
    };
  }
  if (act.moment === 'carnivalCall') {
    return { title: [fixed('Gross - Furria!')], line: sessionLine(act, 'ist eröffnet.') };
  }
  if (act.moment === 'birthday') {
    return {
      title: [salutation('Alles Gute', '!')],
      line: plainClauseOf(act.clause, act.ordinal),
    };
  }
  if (act.moment === 'joinAnniversary') {
    return { title: [anniversaryPhrase(act.years)], line: plainClauseOf(act.clause, null) };
  }
  if (act.moment === 'womensCarnivalDay') {
    return { title: [salutation('Gross - Furria! Weiberfastnacht', '.')], line: null };
  }
  if (act.moment === 'roseMonday') {
    return { title: [salutation('Gross - Furria! Rosenmontag', '.')], line: null };
  }
  if (act.moment === 'carnivalTuesday') {
    return { title: [salutation('Heute Nacht ist Kehraus', '.')], line: null };
  }
  if (act.moment === 'ashWednesday') {
    return {
      title: [fixed('Am Aschermittwoch ist alles vorbei.')],
      line: thanksLine(act, name),
    };
  }
  if (act.moment === 'welcome') {
    return {
      title: [salutation('Willkommen', '.')],
      line: plainClauseOf(act.clause, act.ordinal),
    };
  }

  return {
    title: clausePhrases(act.clause, act.ordinal),
    line:
      act.clause.kind === 'openingToday' && act.ordinal !== null
        ? sessionLine(act, 'beginnt.')
        : null,
  };
};

export const toGreetingCopy = (act: GreetingAct, firstName: string): GreetingCopy => {
  const name = usableName(firstName);
  const composition = compositionOf(act, name);
  const title = choose(composition.title, name);

  return {
    parts: title.parts,
    line: composition.line,
    nameForm: title.nameForm,
    deck: deckOf(act),
  };
};
