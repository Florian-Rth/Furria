import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { COMPACT } from '../roster-columns';

const ICON_EXTENT = '1rem';

interface KkRosterFlagProps {
  icon: KkIconName;
  label: string;
  text?: string;
  persistent?: boolean;
}

export const KkRosterFlag: FC<KkRosterFlagProps> = ({ icon, label, text, persistent = false }) => {
  const caption =
    text === undefined ? null : (
      <Box
        component="span"
        aria-hidden
        sx={
          persistent
            ? { display: 'inline' }
            : { display: { xs: 'none', md: 'inline' }, [COMPACT]: { display: 'none' } }
        }
      >
        {text}
      </Box>
    );

  return (
    <Stack
      direction="row"
      component="span"
      role="img"
      aria-label={label}
      title={label}
      data-kk-roster-flag
      sx={{
        alignItems: 'center',
        gap: 0.5,
        typography: 'caption',
        fontWeight: 700,
        lineHeight: 1.2,
        color: 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      <KkIcon name={icon} sx={{ width: ICON_EXTENT, height: ICON_EXTENT }} />
      {caption}
    </Stack>
  );
};
