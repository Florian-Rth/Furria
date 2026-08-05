import Button from '@mui/material/Button';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { applySubmitLabel } from '@/features/membership/apply-content';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

interface ApplySubmitButtonProps {
  loading: boolean;
}

export const ApplySubmitButton: FC<ApplySubmitButtonProps> = ({ loading }) => {
  const { formState } = useFormContext<MembershipApplicationForm>();

  return (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      loading={loading}
      disabled={!formState.isValid}
    >
      {applySubmitLabel}
    </Button>
  );
};
