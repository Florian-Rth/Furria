import {
  KkAvatarStack,
  KkChip,
  KkEyebrow,
  KkGroupToneField,
  KkMeta,
  KkPanelSection,
  KkSheet,
  KkText,
  kkTokens,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toRecruitingChip } from '@/lib/state-chips';
import { usePeek } from '@/lib/use-peek';
import { toGroupTone } from '../group-identity';
import {
  GROUP_PEEK_CLOSE_LABEL,
  GROUP_PEEK_OPEN_LABEL,
  toGroupContactLine,
  toGroupKindLabel,
  toGroupSizeLine,
  toGroupStandingChips,
} from '../groups-labels';
import type { GroupSummary } from '../schemas';

const GROUP_PATH = '/groups/$groupId';
const DESCRIPTION_LINES = 4;
const CHIP_GAP = 0.75;
const MEMBERS_GAP = 1.25;
const FIELD_RATIO = kkTokens.aspectRatio.banner;
const FIELD_RADIUS = { borderRadius: `${kkTokens.radius.base}px` } as const;

const toGroupId = (group: GroupSummary): number => group.groupId;

interface GroupPeekSheetProps {
  groups: readonly GroupSummary[];
}

export const GroupPeekSheet: FC<GroupPeekSheetProps> = ({ groups }) => {
  const group = usePeek('group', groups, toGroupId);

  if (group === null) {
    return null;
  }

  const tone = toGroupTone(group.groupId, group.tone);
  const openness = toRecruitingChip(group.isRecruiting);
  const standingChips = toGroupStandingChips(group);
  const params = { groupId: String(group.groupId) };
  const initials = group.memberPreview.map((person) =>
    toInitials(person.firstName, person.lastName),
  );

  const kindLabel = toGroupKindLabel(group.groupKindName);

  const kindEyebrow =
    kindLabel === null ? undefined : (
      <KkEyebrow tone="onAccent" size="small">
        {kindLabel}
      </KkEyebrow>
    );

  return (
    <KkSheet
      id={toPeekId('group', group.groupId)}
      title={group.name}
      closeLabel={GROUP_PEEK_CLOSE_LABEL}
    >
      <KkSheet.Body>
        <KkGroupToneField
          tone={tone}
          name={group.name}
          eyebrow={kindEyebrow}
          aspectRatio={FIELD_RATIO}
          sx={FIELD_RADIUS}
        />
        <Stack direction="row" sx={{ gap: CHIP_GAP, flexWrap: 'wrap', minWidth: 0 }}>
          <KkChip tone={openness.tone} dot={openness.dot}>
            {openness.label}
          </KkChip>
          {standingChips.map((chip) => (
            <KkChip key={chip.label} tone={chip.tone} dot={chip.dot}>
              {chip.label}
            </KkChip>
          ))}
        </Stack>
        <KkPanelSection title={GROUP_SECTION_TITLES.about} groupTone={tone}>
          <KkText variant="body2" tone="secondary" clamp={DESCRIPTION_LINES}>
            {group.description}
          </KkText>
        </KkPanelSection>
        <KkPanelSection title={GROUP_SECTION_TITLES.members} groupTone={tone}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: MEMBERS_GAP, minWidth: 0 }}>
            <KkAvatarStack initials={initials} total={group.memberCount} />
            <KkMeta>{toGroupSizeLine(group.memberCount)}</KkMeta>
          </Stack>
        </KkPanelSection>
        <KkPanelSection title={GROUP_SECTION_TITLES.admins} groupTone={tone}>
          <KkMeta>{toGroupContactLine(group)}</KkMeta>
        </KkPanelSection>
      </KkSheet.Body>
      <KkSheet.Actions
        primary={{ label: GROUP_PEEK_OPEN_LABEL, component: Link, to: GROUP_PATH, params }}
      />
    </KkSheet>
  );
};
