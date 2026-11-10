import type { LinkProps } from '@tanstack/react-router';
export interface RecruitBandContent {
  kicker: string;
  headline: string;
  intro: string;
  primaryLabel: string;
  primaryTo: LinkProps['to'];
  secondaryLabel: string;
  secondaryTo: LinkProps['to'];
}

export const recruitBandContent: RecruitBandContent = {
  kicker: 'MITMACHEN · AB 30 € IM JAHR · KINDER 15 €',
  headline: 'WERDE TEIL VON FURRIA',
  intro:
    'Ob auf der Bühne, in der Bütt, beim Kulissenbau oder hinter dem Tresen – eine Session stemmt das halbe Dorf, und die andere Hälfte darf gern dazukommen. Komm vorbei, lern uns kennen und feier die nächste Session mit uns.',
  primaryLabel: 'Mitglied werden →',
  primaryTo: '/join',
  secondaryLabel: 'Veranstaltungen ansehen',
  secondaryTo: '/events',
};
