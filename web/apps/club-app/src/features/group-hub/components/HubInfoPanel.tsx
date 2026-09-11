import { KkChip, KkMeta, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toRecruitingChip } from '@/lib/state-chips';
import { toNoDescriptionLine } from '../group-hub-labels';

interface HubInfoPanelProps {
  groupName: string;
  description: string;
  isRecruiting: boolean;
}

export const HubInfoPanel: FC<HubInfoPanelProps> = ({ groupName, description, isRecruiting }) => {
  const text = description.trim();
  const openness = toRecruitingChip(isRecruiting);

  const body =
    text === '' ? (
      <KkMeta italic>{toNoDescriptionLine(groupName)}</KkMeta>
    ) : (
      <KkText tone="secondary">{text}</KkText>
    );

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 1.75, minWidth: 0, alignItems: 'flex-start' }}>
        {body}
        <KkChip tone={openness.tone} dot={openness.dot}>
          {openness.label}
        </KkChip>
      </Stack>
    </KkPanel>
  );
};
