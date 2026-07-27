import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import type { FC } from 'react';
import { changelogCopy } from '@/features/changelog/changelog-copy';

interface ChangelogBackButtonProps {
  onBack: () => void;
}

export const ChangelogBackButton: FC<ChangelogBackButtonProps> = ({ onBack }) => (
  <Button
    onClick={onBack}
    color="inherit"
    size="small"
    startIcon={<ArrowBackIcon />}
    sx={{ alignSelf: 'flex-start', display: { desktop: 'none' } }}
  >
    {changelogCopy.backToEntryList}
  </Button>
);
