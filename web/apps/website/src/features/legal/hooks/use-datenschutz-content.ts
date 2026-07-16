import type { LegalDocument } from '../types';

// [TODO: …] markers must be filled with real data before the site goes public.
const datenschutzContent: LegalDocument = {
  title: 'Datenschutzerklärung',
  sections: [
    {
      heading: '1. Verantwortlicher',
      paragraphs: [
        'Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:',
        'Florian Rätsch, [TODO: Straße und Hausnummer], [TODO: PLZ und Ort], E-Mail: [TODO: E-Mail-Adresse]',
      ],
    },
    {
      heading: '2. Hosting und Server-Logfiles',
      paragraphs: [
        'Diese Website wird bei [TODO: Hosting-Anbieter, Anschrift] gehostet. Beim Aufruf der Website verarbeitet der Hoster automatisch technisch notwendige Daten in sogenannten Server-Logfiles: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, übertragene Datenmenge sowie Browser- und Betriebssystem-Informationen (User-Agent).',
        'Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse ist der technisch fehlerfreie und sichere Betrieb der Website. Die Logfiles werden vom Hoster nach dessen Aufbewahrungsfristen gelöscht.',
      ],
    },
    {
      heading: '3. Keine Cookies, kein Tracking',
      paragraphs: [
        'Diese Website setzt keine Cookies, verwendet keine Analyse- oder Tracking-Dienste und bindet keine Inhalte von Servern Dritter ein. Alle Schriftarten werden lokal von unserem Server geladen; es findet insbesondere keine Verbindung zu Google Fonts statt.',
      ],
    },
    {
      heading: '4. Testzugang (Passwortabfrage)',
      paragraphs: [
        'Der interne Testbereich ist durch ein Passwort geschützt. Das eingegebene Passwort wird ausschließlich zur Prüfung an unseren Server übertragen und dort weder gespeichert noch protokolliert.',
        'Nach erfolgreicher Prüfung wird der Freischalt-Status ausschließlich im Sitzungsspeicher deines Browsers (sessionStorage) gehalten und beim Schließen des Tabs automatisch gelöscht. Es werden dabei keine personenbezogenen Daten gespeichert.',
      ],
    },
    {
      heading: '5. Deine Rechte',
      paragraphs: [
        'Du hast im Rahmen der DSGVO das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen die Verarbeitung (Art. 21).',
        'Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).',
      ],
    },
    {
      heading: 'Stand',
      paragraphs: ['Juli 2026'],
    },
  ],
};

export const useDatenschutzContent = (): LegalDocument => datenschutzContent;
