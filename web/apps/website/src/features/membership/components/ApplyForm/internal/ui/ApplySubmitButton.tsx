import Button from '@mui/material/Button';
import type { FC } from 'react';
import { applySubmitLabel } from '@/features/membership/apply-content';

interface ApplySubmitButtonProps {
  loading: boolean;
}

export const ApplySubmitButton: FC<ApplySubmitButtonProps> = ({ loading }) => (
  <Button
    type="submit"
    variant="contained"
    color="primary"
    size="large"
    fullWidth
    loading={loading}
  >
    {applySubmitLabel}
  </Button>
);
