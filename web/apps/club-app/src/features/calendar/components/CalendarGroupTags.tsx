import type { KkCalendarLineGroup } from '@furria/ui';
import { KkChip, KkGroupToneChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface CalendarGroupTagsProps {
  groups: readonly KkCalendarLineGroup[];
}

export const CalendarGroupTags: FC<CalendarGroupTagsProps> = ({ groups }) => {
  const tags = groups.map((group) =>
    group.mark === 'club' ? (
      <KkChip key={group.key} tone="ink" size="small">
        {group.name}
      </KkChip>
    ) : (
      <KkGroupToneChip key={group.key} tone={group.mark} size="small">
        {group.name}
      </KkGroupToneChip>
    ),
  );

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
      {tags}
    </Stack>
  );
};
