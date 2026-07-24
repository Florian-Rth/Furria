export interface RecruitBandContent {
  kicker: string;
  headline: string;
  intro: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel: string;
  secondaryTo: string;
}

export const recruitBandContent: RecruitBandContent = {
  kicker: 'MITMACHEN · AB 30 € IM JAHR · KINDER 15 €',
  headline: 'WERDE TEIL VON FURRIA',
  intro:
    'Ob Tanzgarde, Elferrat oder Büttenrede — bei FURRIA ist Platz für alle, die die fünfte Jahreszeit leben. Komm vorbei, lern uns kennen und feier die Session mit uns.',
  primaryLabel: 'Mitglied werden →',
  primaryTo: '/join',
  secondaryLabel: 'Programm ansehen',
  secondaryTo: '/program',
};
