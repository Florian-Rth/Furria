import { joinApplyHref } from './join-content';

export interface JoinClosingBandContent {
  kicker: string;
  headline: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
}

export const joinClosingBandContent: JoinClosingBandContent = {
  kicker: 'ZWEI MINUTEN, DANN IST ES ERLEDIGT',
  headline: 'MACH DEN ANFANG.',
  lead: 'Der Antrag geht direkt an den Verein. Nichts wird abgebucht und nichts ist bindend, bis wir dich aufgenommen haben.',
  ctaLabel: 'Jetzt Antrag stellen →',
  ctaHref: joinApplyHref,
};
