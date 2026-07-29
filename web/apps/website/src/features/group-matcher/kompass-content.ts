import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import type { Importance, Stance } from '@/lib/seed/group-matcher';
import type { MatchAgreement, MatchReason } from './match-reasons';

export const kompassSectionId = 'konfetti-kompass';
export const kompassKicker = 'KONFETTI-KOMPASS';
export const kompassTitle = 'WO PASSE ICH HIN?';

export const kompassIntro =
  'Elf Fragen, keine Anmeldung, kein Name, keine E-Mail-Adresse. Antworte, wie es wirklich ist — und überspring, was dir nichts sagt.';

export interface KompassStanceChoice {
  value: Stance;
  label: string;
}

const stanceOrder: Stance[] = ['yes', 'neutral', 'no'];

export const kompassStanceLabels: Record<Stance, string> = {
  yes: 'Ja',
  neutral: 'Neutral',
  no: 'Nein',
};

export const kompassStanceChoices: KompassStanceChoice[] = stanceOrder.map((value) => ({
  value,
  label: kompassStanceLabels[value],
}));

export const kompassImportanceLabels: Record<Importance, string> = {
  3: 'der Gruppe besonders wichtig',
  2: 'der Gruppe wichtig',
  1: 'für die Gruppe nebensächlich',
};

export const kompassAgreementLabels: Record<MatchAgreement, string> = {
  agree: 'Einig',
  partial: 'Teilweise einig',
  disagree: 'Uneinig',
};

export const kompassLabels = {
  back: '← zurück',
  skip: 'überspringen',
  finish: 'Ergebnis ansehen →',
  restart: 'Von vorne',
  loading: 'Die Fragen kommen gleich.',
  errorTitle: 'Die Fragen kommen nicht durch.',
  errorText:
    'Das liegt an uns, nicht an dir. Versuch es gleich noch einmal — oder schreib uns, dann antwortet ein Mensch.',
  errorRetry: 'Nochmal versuchen',
  errorMail: 'Schreib uns',
} as const;

export const kompassResultLabels = {
  rankingTitle: 'DAS PASST ZU DIR.',
  rankingCaveat:
    'Die Prozente sagen, wie stark sich deine Antworten mit denen der Gruppe decken — nicht, wie gut du bist.',
  topKicker: 'BESTE ÜBEREINSTIMMUNG',
  matchCaption: 'ÜBEREINSTIMMUNG',
  excludedTitle: 'Fällt nach deinen Antworten weg',
  applyCta: 'Antrag stellen →',
  askCta: 'Erst eine Frage stellen',
  changeAnswers: 'Antworten ändern',
  answersKeptHint:
    'Deine Antworten bleiben stehen, solange dieser Tab offen ist — auch nach einem Neuladen.',
  emptyTitle: 'HIER PASST GERADE KEINE GRUPPE.',
  emptyText:
    'Nach deinen Antworten bleibt keine unserer Gruppen übrig — meistens liegt das am Alter. Das heißt nicht, dass für dich kein Platz ist: schreib uns, dann suchen wir gemeinsam einen. Mitglied werden kannst du übrigens auch ohne Gruppe.',
  emptyMailCta: 'Schreib uns',
  emptyApplyCta: 'Antrag ohne Gruppe stellen',
  unansweredTitle: 'NOCH KEINE ANTWORT.',
  unansweredText:
    'Beantworte mindestens eine Frage, dann rechnen wir. Übersprungene Fragen zählen nicht — das hier ist keine Prüfung, sondern nur eine Richtung.',
} as const;

export const kompassMailHref = `mailto:${CLUB_CONTACT_EMAIL}`;

export const kompassProgressDoneLabel = 'Alle Fragen durch';

export const buildProgressLabel = (index: number, total: number): string =>
  index >= total ? kompassProgressDoneLabel : `Frage ${index + 1} von ${total}`;

export const buildAnsweredSummary = (answered: number, total: number): string =>
  answered === 0
    ? 'Du hast jede Frage übersprungen.'
    : `Du hast ${answered} von ${total} Fragen beantwortet.`;

export const buildRankLabel = (rank: number): string => `${rank}.`;

export const buildWhyLabel = (groupName: string): string => `Warum ${groupName}?`;

export const buildPercentageText = (percentage: number): string => `${percentage} %`;

export const buildMatchPercentageLabel = (percentage: number, groupName: string): string =>
  `${buildPercentageText(percentage)} Übereinstimmung mit ${groupName}`;

export const buildReasonAnswerLine = (reason: MatchReason, groupName: string): string =>
  `Du: ${kompassStanceLabels[reason.answer]} · ${groupName}: ${kompassStanceLabels[reason.stance]} · ${kompassImportanceLabels[reason.importance]}`;

export const buildExclusionReason = (questionPrompt: string, answerLabel: string): string =>
  `Deine Antwort „${answerLabel}“ auf „${questionPrompt}“ schließt diese Gruppe aus.`;

export const joinGroupNames = (names: string[]): string => {
  const last = names.at(-1);

  if (last === undefined) {
    return '';
  }

  const leading = names.slice(0, -1);

  return leading.length === 0 ? last : `${leading.join(', ')} und ${last}`;
};

export const buildHandoffNote = (names: string[]): string =>
  `Wir nehmen ${joinGroupNames(names)} als Interesse mit — im Antrag kannst du das ändern.`;

export interface KompassRecruitingBadge {
  label: string;
  note: string;
  color: 'success' | 'default';
}

export const resolveRecruitingBadge = (isRecruiting: boolean): KompassRecruitingBadge =>
  isRecruiting
    ? {
        label: 'Sucht Verstärkung',
        note: 'Diese Gruppe sucht gerade neue Leute.',
        color: 'success',
      }
    : {
        label: 'Sucht gerade nicht',
        note: 'Diese Gruppe sucht gerade niemanden — eine Anfrage ist trotzdem willkommen.',
        color: 'default',
      };
