import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { MERGE_AREAS_APART_NOTE, MERGE_AREAS_LABEL } from '../hall-builder-copy';

const MERGE_ICON = <KkIcon name="area" size="small" />;

export const HallAreaMergeAction: FC = () => {
  const { areaMerge, mergeSelectedAreas } = useHallBuilderContext();

  if (areaMerge === 'hidden') {
    return null;
  }

  const isApart = areaMerge === 'apart';
  const reason = isApart ? <KkNote tone="muted">{MERGE_AREAS_APART_NOTE}</KkNote> : null;

  return (
    <Stack sx={{ gap: 1 }}>
      <KkButton
        variant="outlined"
        size="small"
        startIcon={MERGE_ICON}
        disabled={isApart}
        onClick={mergeSelectedAreas}
      >
        {MERGE_AREAS_LABEL}
      </KkButton>
      {reason}
    </Stack>
  );
};
