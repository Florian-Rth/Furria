import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { stepFigures, stepLabel } from '../../../KkStatePill/state-paint';

interface KkCoverageGridHeadCellProps {
  head: string;
  label: string;
  icon?: KkIconName;
  align?: 'start' | 'center';
}

export const KkCoverageGridHeadCell: FC<KkCoverageGridHeadCellProps> = ({
  head,
  label,
  icon,
  align = 'center',
}) => {
  const shown =
    icon === undefined ? (
      <Box component="span" aria-hidden sx={{ ...stepLabel, ...stepFigures }}>
        {head}
      </Box>
    ) : (
      <KkIcon name={icon} size="small" />
    );

  return (
    <Stack
      role="columnheader"
      aria-label={label}
      title={label}
      sx={{
        alignItems: align === 'center' ? 'center' : 'flex-start',
        color: 'text.secondary',
        minWidth: 0,
      }}
    >
      {shown}
    </Stack>
  );
};
