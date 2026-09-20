import type { KkSx } from '@furria/ui';
import { KkChip, KkHeading, KkIcon, KkMeta, KkPanel, KkStatRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { ManageTileModel } from '../manage-hub-labels';

const BODY_SX = { gap: 1, minWidth: 0, flexGrow: 1 } as const;
const ICON_SX = { flexShrink: 0, alignSelf: 'flex-start' } as const;
const TITLE_SX = { minWidth: 0 } as const;
const FOOT_SX = { mt: 'auto', pt: 0.75, alignItems: 'flex-start', minWidth: 0 } as const;

interface ManageTileProps {
  tile: ManageTileModel;
  sx?: KkSx;
}

export const ManageTile: FC<ManageTileProps> = ({ tile, sx }) => {
  const tone = tile.isEmpty ? 'reserved' : 'cream';
  const countTone = tile.isEmpty ? 'muted' : 'default';
  const foot =
    tile.vacancyLabel === null ? (
      <KkMeta italic={tile.isEmpty}>{tile.footLine}</KkMeta>
    ) : (
      <KkChip tone="gold" size="small">
        {tile.vacancyLabel}
      </KkChip>
    );

  return (
    <KkPanel variant="block" tone={tone} component={Link} to={tile.to} sx={sx}>
      <Stack sx={BODY_SX}>
        <KkIcon name={tile.icon} size="small" sx={ICON_SX} />
        <KkStatRow.Value variant="h3" tone={countTone}>
          {tile.countLabel}
        </KkStatRow.Value>
        <KkHeading level={6} component="h3" sx={TITLE_SX}>
          {tile.title}
        </KkHeading>
        <Stack sx={FOOT_SX}>{foot}</Stack>
      </Stack>
    </KkPanel>
  );
};
