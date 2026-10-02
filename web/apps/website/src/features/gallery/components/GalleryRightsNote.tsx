import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { ClubMailLink } from '@/components/ClubMailLink';
import {
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
    <KkNote>
      {rightsNoteQuestion} {rightsNoteHint}{' '}
      <ClubMailLink sx={{ fontWeight: 700, wordBreak: 'break-word' }} />
    </KkNote>
  </Stack>
);
