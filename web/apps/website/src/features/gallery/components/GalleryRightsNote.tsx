import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  rightsNoteContactHref,
  rightsNoteContactLabel,
  rightsNoteCopyright,
  rightsNoteHint,
  rightsNoteQuestion,
} from '@/features/gallery/gallery-content';

export const GalleryRightsNote: FC = () => (
  <Stack
    data-kk-gallery-rights-note
    sx={{
      gap: 1,
      borderTop: 1,
      borderColor: 'divider',
      pt: { xs: 3, md: 4 },
      maxWidth: '44rem',
    }}
  >
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
      {rightsNoteCopyright}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: 'text.secondary', fontWeight: 500, textWrap: 'pretty' }}
    >
      {rightsNoteQuestion} {rightsNoteHint}{' '}
      <Link href={rightsNoteContactHref} sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
        {rightsNoteContactLabel}
      </Link>
    </Typography>
  </Stack>
);
