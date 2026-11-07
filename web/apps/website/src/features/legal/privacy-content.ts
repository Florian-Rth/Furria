import { CLUB_LEGAL } from './club-legal';
import type { LegalDocument } from './types';

export const privacyContent: LegalDocument = {
  title: 'Datenschutzerklärung',
  sections: [
    {
      heading: '1. Verantwortlicher',
      paragraphs: [
        'Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:',
        `${CLUB_LEGAL.name}, ${CLUB_LEGAL.street}, ${CLUB_LEGAL.place}, vertreten durch den Vorstand ${CLUB_LEGAL.representatives.join(' und ')}. Die Kontaktdaten findest du im Impressum.`,
        'Ein Datenschutzbeauftragter ist für unseren Verein gesetzlich nicht vorgeschrieben und daher nicht benannt.',
      ],
    },
    {
      heading: '2. Hosting und Server-Logfiles',
      paragraphs: [
        'Die Website, die zugehörige Anwendung und ihre Datenbank werden auf Servern der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, betrieben (Rechenzentren in der EU). Mit Hetzner besteht ein Vertrag über Auftragsverarbeitung nach Art. 28 DSGVO.',
        'Beim Aufruf der Website verarbeiten wir automatisch technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, übertragene Datenmenge sowie Browser- und Betriebssystem-Informationen (User-Agent). Die IP-Adresse nutzen wir außerdem kurzzeitig, um missbräuchlich viele Anfragen zu begrenzen.',
        'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist der sichere und fehlerfreie Betrieb der Website. Server-Logfiles werden spätestens nach 30 Tagen gelöscht.',
      ],
    },
    {
      heading: '3. Keine Cookies, kein Tracking',
      paragraphs: [
        'Diese Website setzt keine Cookies, verwendet keine Analyse- oder Tracking-Dienste und bindet keine Inhalte von Servern Dritter ein. Schriftarten und Bilder werden ausschließlich von unserem eigenen Server geladen.',
        'Im Speicher deines Browsers legen wir nur ab, was du selbst auswählst: die gewählte Darstellung (hell oder dunkel) im localStorage und deine Antworten bei „Wo passe ich hin?“ im sessionStorage, der beim Schließen des Tabs gelöscht wird. Diese Angaben verlassen dein Gerät nicht. Die Speicherung ist für die von dir gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).',
      ],
    },
    {
      heading: '4. Beitrittsantrag',
      paragraphs: [
        'Wenn du online einen Beitrittsantrag stellst, verarbeiten wir Vorname, Nachname, Geburtsdatum, Anschrift, E-Mail-Adresse und – wenn du sie angibst – deine Telefonnummer. Das Geburtsdatum brauchen wir, um Mitgliedsart und Beitrag zu bestimmen.',
        'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen, also die Aufnahme in den Verein). Damit niemand fremde Daten einträgt, schicken wir dir eine E-Mail mit einem Bestätigungslink. Bestätigst du den Antrag nicht innerhalb von 48 Stunden, wird er vollständig gelöscht.',
        'Über einen bestätigten Antrag entscheidet der Vorstand; dafür erhält er eine Benachrichtigung per E-Mail. Wird der Antrag abgelehnt, löschen wir ihn. Wirst du aufgenommen, werden deine Angaben Teil der Mitgliederverwaltung des Vereins und so lange gespeichert, wie es die Mitgliedschaft und gesetzliche Aufbewahrungspflichten erfordern.',
        'Bei Minderjährigen holt der Vorstand vor der Aufnahme die Zustimmung der Erziehungsberechtigten ein.',
        'Zum Schutz vor automatisierten Spam-Einsendungen löst dein Browser beim Absenden eine kleine Rechenaufgabe (ALTCHA). Sie wird ausschließlich auf unserem eigenen Server geprüft; es werden dabei keine Daten an Dritte übermittelt.',
      ],
    },
    {
      heading: '5. E-Mail-Versand',
      paragraphs: [
        'E-Mails – etwa die Bestätigung deines Beitrittsantrags und die Benachrichtigung an den Vorstand – versenden wir über den Mailserver von Google (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Dabei verarbeitet Google den Inhalt der E-Mail sowie Absender- und Empfängeradresse.',
        'Eine Übermittlung an die Google LLC in den USA ist nicht auszuschließen. Sie erfolgt auf Grundlage des Angemessenheitsbeschlusses der EU-Kommission zum EU-US Data Privacy Framework, unter dem Google zertifiziert ist (Art. 45 DSGVO).',
      ],
    },
    {
      heading: '6. Links zu sozialen Netzwerken',
      paragraphs: [
        'Wir verlinken auf unsere Auftritte bei Instagram und Facebook und bieten das Teilen von Beiträgen über WhatsApp an. Das sind einfache Links: Solange du sie nicht anklickst, werden keine Daten an diese Dienste übertragen. Nach dem Klick gilt die Datenschutzerklärung des jeweiligen Anbieters.',
      ],
    },
    {
      heading: '7. Deine Rechte',
      paragraphs: [
        'Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3).',
        'Widerspruchsrecht: Verarbeiten wir Daten auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO), kannst du aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO).',
        'Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), zum Beispiel beim Thüringer Landesbeauftragten für den Datenschutz und die Informationsfreiheit, Häßlerstraße 8, 99096 Erfurt.',
      ],
    },
    {
      heading: 'Stand',
      paragraphs: ['November 2026'],
    },
  ],
};
