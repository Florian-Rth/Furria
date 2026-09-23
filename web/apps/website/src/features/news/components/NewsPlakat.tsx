import { KkBroomMark, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsCategory } from '@/features/news/news-content';
import { resolveCategoryContrastText, resolveCategoryTint } from '@/features/news/news-content';

interface NewsPlakatProps {
  category: NewsCategory;
}

const plakatSurface: SxProps<Theme> = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'flex-end',
};

export const NewsPlakat: FC<NewsPlakatProps> = ({ category }) => (
  <Box
    data-kk-news-plakat
    sx={[
      plakatSurface,
      (theme) => ({
        bgcolor: resolveCategoryTint(theme, category),
        color: resolveCategoryContrastText(theme, category),
      }),
    ]}
  >
    <KkBroomMark
      sx={{
        position: 'absolute',
        top: '-2%',
        right: '-4%',
        height: '95%',
        width: 'auto',
        opacity: 0.16,
      }}
    />
    <Typography
      variant="inherit"
      component="span"
      sx={{
        position: 'relative',
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        lineHeight: 0.9,
        letterSpacing: '0.01em',
        p: '0.42em',
      }}
    >
      {category}
    </Typography>
  </Box>
);
