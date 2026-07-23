export interface Group {
  title: string;
  blurb: string;
  memberMeta: string;
  fullText: string;
  lead: string;
  schedule: string;
}

export const GROUPS: Group[] = [
  {
    title: 'Tanzgarde',
    blurb: 'Funkenmariechen & Gardetanz',
    memberMeta: '18 Aktive',
    fullText:
      'Von Funkenmariechen bis Schautanz: Die Tanzgarde ist das tänzerische Herz von FURRIA und steht in jeder Session mehrfach auf der Bühne.',
    lead: 'Sabine Wirbel',
    schedule: 'Dienstags 19:00 · Turnhalle',
  },
  {
    title: 'Männerballett',
    blurb: 'Zwölf Männer, ein Tutu-Traum',
    memberMeta: '12 Aktive',
    fullText:
      'Zwölf Männer, ein Tutu-Traum: Das Männerballett bringt mit viel Selbstironie und überraschender Präzision den ganzen Saal zum Kochen.',
    lead: 'Uwe Fass',
    schedule: 'Mittwochs 20:00 · Vereinsheim',
  },
  {
    title: 'Elferrat',
    blurb: 'Der närrische Rat auf der Bühne',
    memberMeta: '11 Räte',
    fullText:
      'Elf Närrinnen und Narren führen als Elferrat durch die Prunksitzung und wachen über den guten Ton und den Humor der Session.',
    lead: 'Franz-Josef Besen',
    schedule: 'Nach Bedarf · Vereinsheim',
  },
  {
    title: 'Büttenrede',
    blurb: 'Spitze Zunge, spitzer Reim',
    memberMeta: '8 Aktive',
    fullText:
      'Am Rednerpult wird gereimt, gespöttelt und aufgespießt: Die Büttenredner nehmen Großbesenstadt und die große weite Welt liebevoll aufs Korn.',
    lead: 'Marlies Furrmann',
    schedule: 'Nach Absprache · Vereinsheim',
  },
  {
    title: 'Kindergarde',
    blurb: 'Die Kleinsten ganz groß',
    memberMeta: '24 Kinder',
    fullText:
      'Die Kleinsten ganz groß: In der Kindergarde lernen die jüngsten Narren das Tanzen, den Takt und vor allem die Freude am Karneval.',
    lead: 'Lena Kehr',
    schedule: 'Freitags 17:00 · Turnhalle',
  },
  {
    title: 'Organisation',
    blurb: 'Getränke, Kasse & Küche',
    memberMeta: 'Alle Hände',
    fullText:
      'Ohne sie läuft nichts: Das Orga-Team kümmert sich um Getränke, Kasse, Küche und Aufbau — der Maschinenraum hinter jeder Veranstaltung.',
    lead: 'Uwe Fass',
    schedule: 'Nach Bedarf',
  },
];
