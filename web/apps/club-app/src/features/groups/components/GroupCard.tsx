import type { KkSx } from '@furria/ui';
import { KkAvatarStack, KkGroupCard, toImageSource, useKkSheetCommands } from '@furria/ui';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toFoundedLine, toGroupTone } from '../group-identity';
import {
  toCardKindName,
  toGroupCardLeadLine,
  toGroupCardSignal,
  toGroupCardSizeLine,
} from '../groups-labels';
import type { GroupSummary } from '../schemas';

const AVATAR_MAX = 3;
const NO_SHRINK = { flexShrink: 0 } as const;

interface GroupCardProps {
  group: GroupSummary;
  sx?: KkSx;
}

export const GroupCard: FC<GroupCardProps> = ({ group, sx }) => {
  const sheet = useKkSheetCommands();
  const tone = toGroupTone(group.groupId, group.tone);
  const initials = group.memberPreview
    .slice(0, AVATAR_MAX)
    .map((person) => toInitials(person.firstName, person.lastName));
  const portraits = group.memberPreview.map((person) =>
    toImageSource(person.portrait ?? null, 'portrait'),
  );
  const sizeLine = toGroupCardSizeLine(group.memberCount, toFoundedLine(group.foundedYear));

  const avatars = (
    <KkAvatarStack initials={initials} portraits={portraits} max={AVATAR_MAX} sx={NO_SHRINK} />
  );

  const openPeek = (): void => {
    sheet.open(toPeekId('group', group.groupId));
  };

  return (
    <KkGroupCard
      tone={tone}
      icon={group.icon}
      image={toImageSource(group.picture, 'groupPicture')}
      name={group.name}
      kind={toCardKindName(group.name, group.groupKindName)}
      signal={toGroupCardSignal(group)}
      lead={toGroupCardLeadLine(group.admins)}
      avatars={avatars}
      memberLine={sizeLine}
      onSelect={openPeek}
      sx={sx}
    />
  );
};
