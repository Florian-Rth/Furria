import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { aufmacherFlagLabel } from '@/features/news/news-content';

export const NewsAufmacherFlag: FC = () => (
  <Box
    aria-hidden
    data-kk-news-aufmacher-flag
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1,
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      fontFamily: kkTokens.font.display,
      fontSize: '0.9375rem',
      letterSpacing: '0.1em',
      lineHeight: 1,
      px: 1.75,
      py: 1,
      borderBottomRightRadius: `${kkTokens.radius.base}px`,
    }}
  >
    {aufmacherFlagLabel}
  </Box>
);
