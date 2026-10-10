import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNewsDate } from '../../../internal/news-surface/KkNewsDate';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsLeadFooterProps {
  readMoreLabel: string;
  readingTime: string | null;
  fit: KkNewsFit;
}

export const KkNewsLeadFooter: FC<KkNewsLeadFooterProps> = ({
  readMoreLabel,
  readingTime,
  fit,
}) => {
  const readingLine =
    readingTime === null ? null : <KkNewsDate date={readingTime} spacing="tracked" />;

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
        mt: 'auto',
        pt: fitted(fit, { xs: 1.5, md: 2.5 }),
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <Typography variant="body1" component="span" sx={{ fontWeight: 900, color: 'primary.main' }}>
        {readMoreLabel}
      </Typography>
      {readingLine}
    </Stack>
  );
};
