import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { KkNewsLink } from '../../../internal/news-surface/news-link';
import { KkCard } from '../../../KkCard/KkCard';
import type { KkSx } from '../../../kk-sx';

const SIDE_MEDIA_SHARE = '42%';

interface KkNewsTieFrameProps extends PropsWithChildren {
  label: string;
  link: KkNewsLink;
  media?: ReactNode;
  sx?: KkSx;
}

export const KkNewsTieFrame: FC<KkNewsTieFrameProps> = ({ label, link, media, sx, children }) => {
  const body = <KkCard.Body>{children}</KkCard.Body>;
  const content =
    media === undefined ? (
      body
    ) : (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ width: '100%', alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Box sx={{ width: { xs: '100%', sm: SIDE_MEDIA_SHARE }, flexShrink: 0 }}>{media}</Box>
        {body}
      </Stack>
    );

  return (
    <KkCard sx={sx}>
      <KkCard.Action component={link.component} to={link.to} aria-label={label}>
        {content}
      </KkCard.Action>
    </KkCard>
  );
};
