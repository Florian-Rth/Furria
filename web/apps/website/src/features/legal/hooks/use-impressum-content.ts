import type { LegalDocument } from '../types';

// During development the site is operated by Florian privately, not by the club.
// [TODO: …] markers must be filled with real data before the site goes public.
const impressumContent: LegalDocument = {
  title: 'Impressum',
  sections: [
    {
      heading: 'Angaben gemäß § 5 DDG',
      paragraphs: [
        'Florian Rätsch',
        '[TODO: Straße und Hausnummer]',
        '[TODO: PLZ und Ort]',
        'Deutschland',
      ],
    },
    {
      heading: 'Kontakt',
      paragraphs: ['E-Mail: [TODO: E-Mail-Adresse]'],
    },
    {
      heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
      paragraphs: ['Florian Rätsch (Anschrift wie oben)'],
    },
    {
      heading: 'Hinweis zum Betrieb',
      paragraphs: [
        'Diese Website ist ein privates, nicht-kommerzielles Projekt und befindet sich im Aufbau (Vorschau- und Testbetrieb).',
      ],
    },
    {
      heading: 'Haftung für Links',
      paragraphs: [
        'Diese Website enthält derzeit keine Links zu externen Websites Dritter. Sollten künftig Links aufgenommen werden, gilt: Für die Inhalte verlinkter Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.',
      ],
    },
  ],
};

export const useImpressumContent = (): LegalDocument => impressumContent;
