export const seasonChapter = {
  numeral: '03',
  kicker: 'WIE DIE SESSION LÄUFT',
  title: 'DIE SESSION, DIE NIE ENDET',
} as const;

export const seasonIntro =
  'Offiziell dauert eine Session vom 11.11. bis Aschermittwoch. Inoffiziell haben wir das nie so genau genommen.';

export const seasonLoopLabel = 'Zurück zum 11.11.';

export const seasonLoopGlyph = '…';

export const DIAGNOSIS_LOOP = 3;

export type SeasonLoopOutcome = 'loop' | 'diagnosis';

export const resolveLoopOutcome = (loopCount: number): SeasonLoopOutcome =>
  loopCount === DIAGNOSIS_LOOP ? 'diagnosis' : 'loop';

export const seasonDiagnosis = {
  stamp: 'UNHEILBAR',
  eyebrow: 'VEREINSÄRZTLICHER BEFUND',
  title: 'Sessionitis chronica',
  text: 'Dreimal hintereinander durch die ganze Session – Zufall ist das nicht mehr. Der Befund ist eindeutig: Du kommst da nicht mehr raus. Heilung ausgeschlossen, Linderung möglich.',
  sideEffects:
    'Zu Risiken und Nebenwirkungen: Heiserkeit, Muskelkater vom Schunkeln und Konfetti, das noch im Juli aus der Jackentasche fällt.',
  therapyLabel: 'Therapie beginnen →',
  anotherRoundLabel: 'Noch eine Runde',
} as const;

export type SeasonPhase = 'opening' | 'official' | 'unofficial';

export interface SeasonStep {
  tag: string;
  title: string;
  description: string;
  phase: SeasonPhase;
  loopsBack: boolean;
}

export const SEASON_STEPS: SeasonStep[] = [
  {
    tag: '11.11.',
    title: 'Die Eröffnung',
    description:
      'Um 11:11 Uhr beginnt die neue Session – und mit ihr die alljährliche Frage, wo alle Teile der Vereinskleidung geblieben sind.',
    phase: 'opening',
    loopsBack: false,
  },
  {
    tag: 'Februar',
    title: 'Die tollen Tage',
    description:
      'Zwei Prunksitzungen, Weiberfastnacht, Jugend-, Kinder- und Rentnerfasching – und am Rosenmontag ziehen wir in Rot und Weiß beim Umzug in Sondershausen mit.',
    phase: 'official',
    loopsBack: false,
  },
  {
    tag: 'Aschermittwoch',
    title: 'Offiziell vorbei',
    description:
      'Kehraus. Für andere das Ende, für uns ein Jahrestag: An einem Aschermittwoch fing 1971 alles an.',
    phase: 'official',
    loopsBack: false,
  },
  {
    tag: 'Sommer',
    title: 'Inoffiziell weiter',
    description:
      'Beim Sommerfest sind wir unter uns – ohne Bühne, ohne Kostüm, aber mit derselben Ausdauer wie im Februar. Und ganz nebenbei beginnen die Tanzgruppen schon mit dem Training für die nächste Session.',
    phase: 'unofficial',
    loopsBack: false,
  },
  {
    tag: 'Herbst',
    title: 'Die Herbstwanderung',
    description:
      'Gewandert wird dabei meist wenig, eingekehrt umso gründlicher. Auf dem Rückweg ist es dann wirklich nicht mehr weit bis',
    phase: 'unofficial',
    loopsBack: true,
  },
];
