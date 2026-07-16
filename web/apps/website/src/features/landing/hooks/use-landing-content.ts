import type { LandingContent } from '../types';

const landingContent: LandingContent = {
  wordmark: 'FURRIA',
  mastheadMeta: 'Furrscher Carnevals Club e.V. · Großbesenstadt · seit 1971',
  headlineLine1: 'DIE FÜNFTE JAHRESZEIT',
  headlineLine2: 'BEGINNT HIER.',
  tagline:
    'Der Furrsche Carnevals Club baut hier sein neues Zuhause. Bald findet ihr Programm, Tickets und Neuigkeiten an dieser Stelle.',
  ctaLabel: 'Einlass',
};

export const useLandingContent = (): LandingContent => landingContent;
