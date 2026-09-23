import type { KkBarMorphName } from '@furria/ui';

export interface LabMorph {
  slug: string;
  name: KkBarMorphName;
  title: string;
  summary: string;
}

export const LAB_TITLE = 'Labor';
export const LAB_LEAD = 'Experimente, die noch keinen festen Platz haben.';
export const LAB_PATH = '/lab';
export const MORPH_LAB_BANK = 'Seitenwechsel in der Leiste';

export const STAGE_TITLE = 'Probebühne';
export const STAGE_LEAD = 'Von hier aus geht es tiefer – die Leiste zeigt den Wechsel.';
export const COUNCIL_TITLE = 'Elferrat';
export const COUNCIL_LEAD = 'Elf Narren, ein Präsident und sehr viele Sitzungen.';
export const PRESIDENT_TITLE = 'Sitzungspräsident Heinz Hansen';
export const BACK_TO_LAB = 'Zurück ins Labor';

export const LAB_MORPHS: readonly LabMorph[] = [
  {
    slug: 'besenschwung',
    name: 'broomSweep',
    title: 'Besenschwung',
    summary: 'Der Besen fegt den alten Titel weg und faltet sich zum Pfeil',
  },
  {
    slug: 'staffelstab',
    name: 'relay',
    title: 'Staffelstab',
    summary: 'Die Überschrift fliegt in die Leiste und wird zum Zurück-Ziel',
  },
  {
    slug: 'glastropfen',
    name: 'glassDrop',
    title: 'Glastropfen',
    summary: 'Das Zeichen löst sich als Glastropfen ab, der Titel kräuselt sich',
  },
];

export const LAB_ENTRY_META = `${LAB_MORPHS.length} Experimente`;

export const labMorphOf = (slug: string): LabMorph | null =>
  LAB_MORPHS.find((morph) => morph.slug === slug) ?? null;

export const stagePathOf = (morph: LabMorph): string => `${LAB_PATH}/${morph.slug}`;

export const councilPathOf = (morph: LabMorph): string => `${stagePathOf(morph)}/elferrat`;

export const presidentPathOf = (morph: LabMorph): string => `${councilPathOf(morph)}/praesident`;
