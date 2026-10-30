import { KkChip } from '@furria/ui/KkChip';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  CALL_NONE,
  CALL_TITLE,
  ON_STAGE_CHIP,
  toCallCount,
  toCallGroupTitle,
  toPersonName,
} from '../heute-b-copy';
import type { CallGroup } from '../heute-board';

interface HeuteCallListProps {
  groups: readonly CallGroup[];
}

const onStageChip = (
  <KkChip tone="gold" size="small">
    {ON_STAGE_CHIP}
  </KkChip>
);

export const HeuteCallList: FC<HeuteCallListProps> = ({ groups }) => {
  const items = groups.flatMap((group) => {
    const title = toCallGroupTitle(group.number, group.line.name);
    const count = toCallCount(group.people.length);
    const tone = group.line.group?.tone ?? null;
    const people = group.people.map((call) => {
      const key = `${group.line.appearanceId}:${call.person.personId}`;
      const name = toPersonName(call.person.firstName, call.person.lastName);
      const chips = call.onStageNow ? onStageChip : null;
      const state = call.onStageNow ? 'marked' : 'rest';

      return (
        <KkNumberedList.Row
          key={key}
          rowKey={key}
          mark={null}
          title={name}
          chips={chips}
          state={state}
          arrive={false}
          openLabel={name}
        />
      );
    });

    return [
      <KkNumberedList.Section
        key={`group:${group.line.appearanceId}`}
        title={title}
        meta={count}
        tone={tone}
      />,
      ...people,
    ];
  });
  const list =
    items.length === 0 ? (
      <KkMeta>{CALL_NONE}</KkMeta>
    ) : (
      <KkNumberedList label={CALL_TITLE}>{items}</KkNumberedList>
    );

  return (
    <Stack component="section" aria-label={CALL_TITLE} sx={{ gap: 0.75, minWidth: 0 }}>
      <KkHeading level={4} component="h2">
        {CALL_TITLE}
      </KkHeading>
      {list}
    </Stack>
  );
};
