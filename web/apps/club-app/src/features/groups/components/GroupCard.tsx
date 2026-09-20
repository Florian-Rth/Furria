import type { KkSx } from '@furria/ui';
import {
  KkAvatarStack,
  KkCard,
  KkChip,
  KkEyebrow,
  KkGroupToneEdge,
  KkGroupToneField,
  KkMeta,
  kkTokens,
  useKkSheetCommands,
} from '@furria/ui';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toGroupTone } from '../group-identity';
import {
  toGroupCardChips,
  toGroupCardLabel,
  toGroupKindLabel,
  toGroupLeadLine,
  toGroupSizeLine,
} from '../groups-labels';
import type { GroupSummary } from '../schemas';

const FACE_RATIO = kkTokens.aspectRatio.landscape;
const AVATAR_MAX = 3;
const FACE_FILL = { position: 'absolute', inset: 0 } as const;

interface GroupCardProps {
  group: GroupSummary;
  sx?: KkSx;
}

export const GroupCard: FC<GroupCardProps> = ({ group, sx }) => {
  const sheet = useKkSheetCommands();
  const tone = toGroupTone(group.groupId, group.tone);
  const chips = toGroupCardChips(group);
  const initials = group.memberPreview.map((person) =>
    toInitials(person.firstName, person.lastName),
  );

  const openPeek = (): void => {
    sheet.open(toPeekId('group', group.groupId));
  };

  return (
    <KkCard sx={sx}>
      <KkCard.Action onClick={openPeek} aria-label={toGroupCardLabel(group.name)}>
        <KkCard.Media aspectRatio={FACE_RATIO}>
          <KkGroupToneField tone={tone} name={group.name} sx={FACE_FILL} />
        </KkCard.Media>
        <KkGroupToneEdge tone={tone} />
        <KkCard.Body>
          <KkEyebrow tone="muted" size="small">
            {toGroupKindLabel(group.groupKindName)}
          </KkEyebrow>
          <KkCard.Meta>
            {chips.map((chip) => (
              <KkChip key={chip.label} tone={chip.tone} dot={chip.dot} size="small">
                {chip.label}
              </KkChip>
            ))}
          </KkCard.Meta>
          <KkMeta>{toGroupLeadLine(group.admins)}</KkMeta>
          <KkCard.Footer>
            <KkAvatarStack initials={initials} max={AVATAR_MAX} total={group.memberCount} />
            <KkMeta>{toGroupSizeLine(group.memberCount)}</KkMeta>
          </KkCard.Footer>
        </KkCard.Body>
      </KkCard.Action>
    </KkCard>
  );
};
