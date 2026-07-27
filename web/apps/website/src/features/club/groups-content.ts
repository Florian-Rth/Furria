import type { Theme } from '@mui/material/styles';

export const groupsChapter = {
  numeral: '04',
  kicker: 'WER BEI FURRIA AUFTRITT',
  title: 'UNSERE GRUPPEN',
} as const;

export interface Group {
  title: string;
  blurb: string;
  memberMeta: string;
  fullText: string;
  lead: string;
}

export const GROUPS: Group[] = [
  {
    title: 'Tanzgarde',
    blurb: 'Funkenmariechen jenseits der Schallmauer',
    memberMeta: '18 Aktive · 1 Schallmauer',
    fullText:
      'Die Kür der Tanzgarde ist inzwischen so schnell, dass die Jury sie nur noch in Zeitlupe bewerten kann. Zweimal wurde die Halle vorsorglich geräumt.',
    lead: 'Hildegard von Bingen',
  },
  {
    title: 'Männerballett',
    blurb: 'Zwölf Männer, ein Tutu, eine Weltbühne',
    memberMeta: '12 Aktive · 3 Zugaben',
    fullText:
      'Seit dem versehentlichen Gastspiel an der Mailänder Scala probt das Männerballett ausschließlich in Spitzenschuhen. Tschaikowski liegt in Marschtakt vor.',
    lead: 'Ludwig van Beethoven',
  },
  {
    title: 'Elferrat',
    blurb: 'Elf Räte, zwölf Meinungen',
    memberMeta: '11 Räte · 1 Zeitzone',
    fullText:
      'Der Elferrat wacht über Humor und Zeitrechnung. Auf seinen Beschluss gilt im Vereinsheim die Zeitzone UTC+11:11 — Sitzungen beginnen daher immer um 11:11 Uhr.',
    lead: 'Otto von Bismarck',
  },
  {
    title: 'Büttenrede',
    blurb: 'Spitze Zunge, geprüfter Reim',
    memberMeta: '8 Aktive · 1 Reimprüfung',
    fullText:
      'Jede Rede muss vor dem Vortrag die Reimprüfung bestehen. „Faust“ wurde zugelassen — gekürzt auf elf Minuten und mit Tusch.',
    lead: 'Clara Schumann',
  },
  {
    title: 'Kindergarde',
    blurb: 'Die Kleinsten, ganz groß',
    memberMeta: '24 Kinder · 12 Bühnenplätze',
    fullText:
      'Die Kindergarde tanzt traditionell auf einer Bühne, die für die Hälfte von ihnen gebaut wurde. Vergessen wurde dabei noch kein einziger Schritt.',
    lead: 'Alexander von Humboldt',
  },
  {
    title: 'Organisation',
    blurb: 'Getränke, Kasse & Konfettistatik',
    memberMeta: 'Alle Hände · 4,2 Tonnen',
    fullText:
      'Das Orga-Team verwaltet Getränke, Kasse und Küche — und seit 1998 das Konfettilager im Keller, dessen Statik jedes Jahr neu berechnet wird.',
    lead: 'Carl Friedrich Gauß',
  },
];

export const groupsIntro = `Aktuell ${GROUPS.length} Gruppen — die Liste wächst.`;

export const groupsModalLabels = {
  lead: 'Leitung',
  cta: 'Mitglied werden →',
  close: 'Schließen',
} as const;

export const resolveGroupTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  const tints = [palette.primary.main, palette.warning.main, palette.text.primary];
  return tints[index % tints.length] ?? palette.primary.main;
};
