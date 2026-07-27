import Button from '@mui/material/Button';
import type { FC } from 'react';
import { copiedLinkLabel, copyLinkLabel } from '@/features/news/news-content';
import { useCopyLink } from '../logic/use-copy-link';

export const NewsCopyLinkButton: FC = () => {
  const { copied, copyLink } = useCopyLink();

  return (
    <Button
      type="button"
      onClick={(): void => {
        void copyLink();
      }}
      variant="outlined"
      size="large"
      sx={{
        minHeight: '2.75rem',
        alignSelf: { xs: 'stretch', sm: 'auto' },
        color: 'text.primary',
        borderColor: 'divider',
        '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
        '&:focus-visible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      {copied ? copiedLinkLabel : copyLinkLabel}
    </Button>
  );
};
