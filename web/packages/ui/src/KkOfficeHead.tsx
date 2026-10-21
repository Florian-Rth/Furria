import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkSx } from './kk-sx';

interface KkOfficeHeadProps {
  mark: ReactNode;
  title: string;
  facts?: ReactNode;
  actions?: ReactNode;
  sx?: KkSx;
}

export const KkOfficeHead: FC<KkOfficeHeadProps> = ({ mark, title, facts, actions, sx }) => {
  const actionSlot =
    actions === undefined ? null : (
      <Stack
        direction="row"
        sx={{ flexShrink: 0, alignItems: 'center', gap: 0.25, alignSelf: 'flex-start' }}
      >
        {actions}
      </Stack>
    );

  return (
    <Stack
      direction="row"
      data-kk-office-head
      sx={[{ alignItems: 'center', gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {mark}
      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
        <Typography component="h2" variant="h3" sx={{ lineHeight: 1.05, overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            columnGap: 1.25,
            rowGap: 0.25,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          {facts}
        </Stack>
      </Stack>
      {actionSlot}
    </Stack>
  );
};
