import type { MyAct } from '@/features/acts/schemas';

type LabDraftSlug = 'act-a' | 'act-b' | 'act-c';

export interface LabDraftLink {
  kind: 'act' | 'group';
  key: string;
  to: string;
  label: string;
  meta: string | undefined;
}

export interface LabDraft {
  slug: LabDraftSlug;
  title: string;
  lead: string;
  links: LabDraftLink[];
}

interface LabDraftSpec {
  slug: LabDraftSlug;
  title: string;
  lead: string;
}

const SPECS: readonly LabDraftSpec[] = [
  { slug: 'act-a', title: 'A · Eine Karte', lead: 'Alles zum Auftritt auf einer Karte' },
  { slug: 'act-b', title: 'B · Was kommt', lead: 'Termine der Reihe nach, Üben immer unten' },
  { slug: 'act-c', title: 'C · Vier Kacheln', lead: 'Abend, Training, Üben, Besetzung' },
];

const groupsOf = (acts: readonly MyAct[]): { groupId: number; name: string }[] => {
  const seen = new Map<number, string>();

  for (const act of acts) {
    if (act.group !== null && !seen.has(act.group.groupId)) {
      seen.set(act.group.groupId, act.group.name);
    }
  }

  return [...seen].map(([groupId, name]) => ({ groupId, name }));
};

export const labDraftsOf = (acts: readonly MyAct[]): LabDraft[] => {
  if (acts.length === 0) {
    return [];
  }

  const groups = groupsOf(acts);

  return SPECS.map((spec) => ({
    ...spec,
    links: [
      ...acts.map(
        (act): LabDraftLink => ({
          kind: 'act',
          key: `act-${act.actId}`,
          to: `/lab/${spec.slug}/${act.actId}`,
          label: act.name,
          meta: act.group?.name,
        }),
      ),
      ...groups.map(
        (group): LabDraftLink => ({
          kind: 'group',
          key: `group-${group.groupId}`,
          to: `/lab/${spec.slug}/group/${group.groupId}`,
          label: group.name,
          meta: undefined,
        }),
      ),
    ],
  }));
};
