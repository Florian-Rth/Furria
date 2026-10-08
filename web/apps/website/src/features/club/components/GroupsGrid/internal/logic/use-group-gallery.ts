import type { KkGroupTone } from '@furria/ui';
import { useTheme } from '@mui/material/styles';
import {
  buildGroupBadge,
  buildGroupsIntro,
  countRecruitingGroups,
  groupByKind,
  resolveSectionTitle,
} from '@/features/club/groups-content';
import { resolveCycleTint } from '@/features/club/tint-cycle';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import type { ActiveGroup } from './use-group-modal';
import { useGroupModal } from './use-group-modal';

export interface GroupTileModel {
  group: PublicGroup;
  tint: string;
  tone: KkGroupTone | undefined;
  badge: string;
  open: () => void;
}

export interface GroupSectionModel {
  key: string;
  title: string | null;
  tiles: GroupTileModel[];
}

export interface GroupGallery {
  intro: string;
  sections: GroupSectionModel[];
  activeGroup: ActiveGroup | null;
  close: () => void;
}

export const useGroupGallery = (groups: PublicGroup[]): GroupGallery => {
  const theme = useTheme();
  const kindSections = groupByKind(groups);
  const ordered = kindSections.flatMap((section) => section.groups);
  const { activeGroup, openGroup, close } = useGroupModal(ordered);

  const toTile = (group: PublicGroup): GroupTileModel => {
    const index = ordered.indexOf(group);

    return {
      group,
      tint: resolveCycleTint(theme, index),
      tone: group.tone ?? undefined,
      badge: buildGroupBadge(index),
      open: (): void => openGroup(group.groupId),
    };
  };

  return {
    intro: buildGroupsIntro(groups.length, countRecruitingGroups(groups)),
    sections: kindSections.map((section) => ({
      key: section.kindName ?? '',
      title: resolveSectionTitle(section.kindName, kindSections.length),
      tiles: section.groups.map(toTile),
    })),
    activeGroup,
    close,
  };
};
